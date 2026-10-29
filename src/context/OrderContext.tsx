import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, LocalCanteenStore, supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types/canteen';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  myOrders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  createOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  readyOrderNotification: Order | null;
  dismissReadyNotification: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [readyOrderNotification, setReadyOrderNotification] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!isAdmin && user) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (!error && data) {
          const formatted: Order[] = data.map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            token_number: d.token_number,
            total_amount: Number(d.total_amount),
            payment_status: d.payment_status,
            payment_id: d.payment_id,
            order_status: d.order_status,
            pickup_time: d.pickup_time,
            special_instructions: d.special_instructions,
            items: d.order_items || [],
            created_at: d.created_at,
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error('Error fetching orders from Supabase:', err);
        setOrders(LocalCanteenStore.getOrders());
      }
    } else {
      setOrders(LocalCanteenStore.getOrders());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    if (isSupabaseConfigured && supabase) {
      // Supabase Realtime channel
      const channel = supabase
        .channel('canteen-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            const updated = payload.new as any;
            if (updated) {
              // Check if order became ready for current student
              if (
                updated.order_status === 'Ready for Pickup' &&
                user &&
                updated.user_id === user.id
              ) {
                setReadyOrderNotification(updated);
                playChime();
              }
              fetchOrders();
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      // Local reactive fallback store
      const unsubscribe = LocalCanteenStore.subscribe(() => {
        const currentOrders = LocalCanteenStore.getOrders();
        // Check for transition to 'Ready for Pickup'
        if (user && !isAdmin) {
          const justReady = currentOrders.find(
            (o) =>
              (o.user_id === user.id || o.user_email === user.email) &&
              o.order_status === 'Ready for Pickup'
          );
          if (justReady) {
            setReadyOrderNotification(justReady);
            playChime();
          }
        }
        setOrders(currentOrders);
      });
      return () => unsubscribe();
    }
  }, [user, isAdmin]);

  const playChime = () => {
    if (typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch {
        // Audio playback error or blocked by autoplay
      }
    }
  };

  const createOrder = async (order: Order): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: order.user_id,
            token_number: order.token_number,
            total_amount: order.total_amount,
            payment_status: order.payment_status,
            payment_id: order.payment_id,
            order_status: order.order_status,
            pickup_time: order.pickup_time,
            special_instructions: order.special_instructions,
          })
          .select()
          .single();

        if (orderErr || !insertedOrder) {
          console.error('Supabase order insert error:', orderErr);
          LocalCanteenStore.addOrder(order);
          setOrders(LocalCanteenStore.getOrders());
          return true;
        }

        // Insert order items
        const itemRows = order.items.map((it) => ({
          order_id: insertedOrder.id,
          menu_item_id: it.menu_item_id.startsWith('item-') ? null : it.menu_item_id,
          item_name: it.item_name,
          quantity: it.quantity,
          price: it.price,
        }));

        await supabase.from('order_items').insert(itemRows);
        await fetchOrders();
        return true;
      } catch (e) {
        console.error('Order creation fallback:', e);
        LocalCanteenStore.addOrder(order);
        setOrders(LocalCanteenStore.getOrders());
        return true;
      }
    } else {
      LocalCanteenStore.addOrder(order);
      setOrders(LocalCanteenStore.getOrders());
      return true;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ order_status: status, updated_at: new Date().toISOString() })
          .eq('id', orderId);
        await fetchOrders();
      } catch (err) {
        console.error('Supabase update order status error:', err);
        LocalCanteenStore.updateOrderStatus(orderId, status);
        setOrders(LocalCanteenStore.getOrders());
      }
    } else {
      LocalCanteenStore.updateOrderStatus(orderId, status);
      setOrders(LocalCanteenStore.getOrders());
    }
  };

  const dismissReadyNotification = () => {
    setReadyOrderNotification(null);
  };

  const myOrders = orders.filter((o) => {
    if (!user) return true;
    return o.user_id === user.id || o.user_email === user.email;
  });

  const activeOrder = myOrders.find(
    (o) => o.order_status !== 'Completed' && o.order_status !== 'Cancelled'
  ) || null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        myOrders,
        activeOrder,
        loading,
        createOrder,
        updateOrderStatus,
        readyOrderNotification,
        dismissReadyNotification,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
