import React, { useState, useEffect } from 'react'
import Navbar from './components/UI/Navbar'
import Hero from './components/Sections/Hero'
import About from './components/Sections/About'
import Services from './components/Sections/Services'
import Gallery from './components/Sections/Gallery'
import Booking from './components/Sections/Booking'
import Footer from './components/UI/Footer'
import WhatsAppButton from './components/UI/WhatsAppButton'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminLogin from './components/Admin/AdminLogin'
import AuthCallback from './components/Admin/AuthCallback'
import { supabase } from './lib/supabase'
import './index.css'

function App() {
  const [view, setView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [spaSettings, setSpaSettings] = useState({
    spaName: 'Venus Elegant Spa',
    phone: '+1 (849) 316-4217',
    address: 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este'
  });

  // Auth logic - runs once
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetting(true);
        setView('admin');
        window.location.hash = '#/admin';
      }
    });

    const handleHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search;

      // Handle Supabase auth callback
      if (path.includes('/auth/confirm')) {
        setView('auth-callback');
        return;
      }

      if (hash.startsWith('#/admin')) {
        setView('admin');
        // Check for recovery mode in hash or search params
        if (hash.includes('type=recovery') || search.includes('type=recovery')) {
          setIsResetting(true);
        }
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      window.removeEventListener('hashchange', handleHash);
      subscription.unsubscribe();
    };
  }, []);

  // Settings logic - refreshes when view changes or via Realtime
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').single();
        if (data && !error) {
          setSpaSettings({
            spaName: data.spa_name || 'Venus Elegant Spa',
            phone: data.phone || '+1 (849) 316-4217',
            address: data.address || 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este',
            openingHour: data.opening_hour || '09:00',
            closingHour: data.closing_hour || '19:00',
            appointmentsInterval: data.appointments_interval || '60 min',
            autoApprove: data.auto_approve || false
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };

    fetchSettings();

    const settingsSubscription = supabase
      .channel('settings-changes-app')
      .on('postgres_changes', { event: '*', table: 'settings' }, (payload) => {
        if (payload.new) {
          const newData = payload.new;
          setSpaSettings({
            spaName: newData.spa_name || 'Venus Elegant Spa',
            phone: newData.phone || '+1 (849) 316-4217',
            address: newData.address || 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este',
            openingHour: newData.opening_hour || '09:00',
            closingHour: newData.closing_hour || '19:00',
            appointmentsInterval: newData.appointments_interval || '60 min',
            autoApprove: newData.auto_approve || false
          });
        }
      })
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, [view]);

  if (loading) return null;

  // Handle auth callback from Supabase
  if (view === 'auth-callback') {
    return <AuthCallback />;
  }

  if (view === 'admin' || isResetting) {
    if (!isLoggedIn && !isResetting) {
      return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
    }
    return <AdminDashboard
      isResetting={isResetting}
      onResetComplete={() => setIsResetting(false)}
      onLogout={async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setIsResetting(false);
        window.location.hash = '#/';
      }}
    />;
  }

  return (
    <div className="app-container">
      <Navbar spaSettings={spaSettings} />
      <main>
        <Hero spaSettings={spaSettings} />
        <About />
        <Services />
        <Gallery />
        <Booking spaSettings={spaSettings} />
      </main>
      <Footer spaSettings={spaSettings} />
      <WhatsAppButton spaSettings={spaSettings} />
    </div>
  )
}

export default App
