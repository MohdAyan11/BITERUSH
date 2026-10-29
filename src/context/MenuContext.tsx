import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_MENU_ITEMS } from '../data/initialMenu';
import { isSupabaseConfigured, LocalCanteenStore, supabase } from '../lib/supabase';
import { FoodCategory, MenuItem } from '../types/canteen';

interface MenuContextType {
  items: MenuItem[];
  categories: FoodCategory[];
  activeCategory: FoodCategory;
  setActiveCategory: (cat: FoodCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  vegOnly: boolean;
  setVegOnly: (veg: boolean) => void;
  filteredItems: MenuItem[];
  loading: boolean;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<boolean>;
  updateMenuItem: (item: MenuItem) => Promise<boolean>;
  deleteMenuItem: (id: string) => Promise<boolean>;
  toggleAvailability: (id: string) => Promise<void>;
  refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const CATEGORIES: FoodCategory[] = [
  'All',
  'Breakfast',
  'Snacks',
  'Main Course',
  'Beverages',
  'Desserts',
];

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setItems(data as MenuItem[]);
        } else {
          // If table is newly created and empty, show initial menu
          setItems(LocalCanteenStore.getMenuItems());
        }
      } catch (err) {
        console.error('Supabase fetch menu error:', err);
        setItems(LocalCanteenStore.getMenuItems());
      }
    } else {
      setItems(LocalCanteenStore.getMenuItems());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('canteen-menu-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          () => {
            fetchItems();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      const unsub = LocalCanteenStore.subscribe(() => {
        setItems(LocalCanteenStore.getMenuItems());
      });
      return () => unsub();
    }
  }, []);

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at'>): Promise<boolean> => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('menu_items').insert({
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price,
          image_url: item.image_url,
          preparation_time: item.preparation_time,
          available: item.available,
          is_veg: item.is_veg ?? true,
          is_bestseller: item.is_bestseller ?? false,
        });
        if (error) throw error;
        await fetchItems();
        return true;
      } catch (e) {
        console.error('Supabase add menu error:', e);
        LocalCanteenStore.saveMenuItem(newItem);
        setItems(LocalCanteenStore.getMenuItems());
        return true;
      }
    } else {
      LocalCanteenStore.saveMenuItem(newItem);
      setItems(LocalCanteenStore.getMenuItems());
      return true;
    }
  };

  const updateMenuItem = async (item: MenuItem): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            image_url: item.image_url,
            preparation_time: item.preparation_time,
            available: item.available,
            is_veg: item.is_veg,
            is_bestseller: item.is_bestseller,
          })
          .eq('id', item.id);
        if (error) throw error;
        await fetchItems();
        return true;
      } catch (e) {
        console.error('Supabase update menu error:', e);
        LocalCanteenStore.saveMenuItem(item);
        setItems(LocalCanteenStore.getMenuItems());
        return true;
      }
    } else {
      LocalCanteenStore.saveMenuItem(item);
      setItems(LocalCanteenStore.getMenuItems());
      return true;
    }
  };

  const deleteMenuItem = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('menu_items').delete().eq('id', id);
        await fetchItems();
        return true;
      } catch (e) {
        console.error('Supabase delete menu error:', e);
        LocalCanteenStore.deleteMenuItem(id);
        setItems(LocalCanteenStore.getMenuItems());
        return true;
      }
    } else {
      LocalCanteenStore.deleteMenuItem(id);
      setItems(LocalCanteenStore.getMenuItems());
      return true;
    }
  };

  const toggleAvailability = async (id: string): Promise<void> => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('menu_items')
          .update({ available: !target.available })
          .eq('id', id);
        await fetchItems();
      } catch (e) {
        console.error('Supabase toggle availability error:', e);
        LocalCanteenStore.toggleItemAvailability(id);
        setItems(LocalCanteenStore.getMenuItems());
      }
    } else {
      LocalCanteenStore.toggleItemAvailability(id);
      setItems(LocalCanteenStore.getMenuItems());
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.is_veg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <MenuContext.Provider
      value={{
        items,
        categories: CATEGORIES,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        vegOnly,
        setVegOnly,
        filteredItems,
        loading,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleAvailability,
        refreshMenu: fetchItems,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
