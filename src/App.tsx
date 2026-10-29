import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ReadyOrderAlert } from './components/ReadyOrderAlert';

import { LandingPage } from './pages/LandingPage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { Order } from './types/canteen';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setTrackingOrderId(order.id);
    setCurrentTab('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-orange-500 selection:text-white font-sans">
      {/* Realtime Ready for Pickup Alert */}
      <ReadyOrderAlert onViewOrder={handleTrackSpecificOrder} />

      {/* Primary Top Bar Contract */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentTab === 'home' && <LandingPage onNavigate={handleNavigate} />}
        {currentTab === 'menu' && <MenuPage onNavigate={handleNavigate} />}
        {currentTab === 'cart' && <CartPage onNavigate={handleNavigate} />}
        {currentTab === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}
        {currentTab === 'confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onNavigate={handleNavigate}
            onTrackOrder={handleTrackSpecificOrder}
          />
        )}
        {currentTab === 'tracking' && (
          <OrderTrackingPage
            orderId={trackingOrderId}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'orders' && (
          <MyOrdersPage
            onNavigate={handleNavigate}
            onTrackOrder={handleTrackSpecificOrder}
          />
        )}
        {currentTab === 'profile' && (
          <ProfilePage
            onNavigate={handleNavigate}
            onTrackOrder={handleTrackSpecificOrder}
          />
        )}
        {currentTab === 'admin' && <AdminDashboard />}
        {currentTab === 'auth' && <AuthPage onNavigate={handleNavigate} />}
      </main>

      {/* Canteen Footer */}
      <Footer />

      {/* Mobile-first Bottom Touch Bar */}
      <MobileBottomNav currentTab={currentTab} onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MenuProvider>
          <OrderProvider>
            <MainApp />
          </OrderProvider>
        </MenuProvider>
      </CartProvider>
    </AuthProvider>
  );
}
