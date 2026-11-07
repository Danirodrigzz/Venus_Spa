import React, { useState, useEffect } from 'react';
import Navbar from './components/UI/Navbar';
import Hero from './components/Sections/Hero';
import About from './components/Sections/About';
import Services from './components/Sections/Services';
import Experience from './components/Sections/Experience';
import Gallery from './components/Sections/Gallery';
import Testimonials from './components/Sections/Testimonials';
import Booking from './components/Sections/Booking';
import Footer from './components/UI/Footer';
import WhatsAppButton from './components/UI/WhatsAppButton';
import CustomCursor from './components/UI/CustomCursor';
import Preloader from './components/UI/Preloader';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import AuthCallback from './components/Admin/AuthCallback';
import { supabase } from './lib/supabase';
import useLenis from './hooks/useLenis';
import { AudioProvider } from './context/AudioContext';
import SoundToggle from './components/UI/SoundToggle';
import './index.css';

function App() {
  const [view, setView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [spaSettings, setSpaSettings] = useState({
    spaName: 'Venus Elegant Spa',
    phone: '+1 (849) 316-4217',
    address: 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este'
  });

  // Enable Lenis Smooth Scroll on home view
  useLenis();

  // Auth logic - runs once
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 800);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(safetyTimer);
      setIsLoggedIn(!!data?.session);
      setLoading(false);
    }).catch((err) => {
      clearTimeout(safetyTimer);
      console.warn("Auth session check:", err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetting(true);
        setView('admin');
        window.location.hash = '#/admin';
      }
      if (event === 'USER_UPDATED') {
        setIsLoggedIn(true);
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

  // Only show blank placeholder if actively verifying admin login
  if (loading && view === 'admin') {
    return <div style={{ minHeight: '100vh', backgroundColor: '#1E1713' }} />;
  }

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
        window.location.hash = '#/admin';
      }}
    />;
  }

  return (
    <AudioProvider>
      <div className="app-container">
        {/* Luxury Preloader & Interactive Sound Consent Entry */}
        <Preloader />

        {/* Discrete Ambient Audio Equalizer Toggle (Bottom-Left) */}
        <SoundToggle />

        {/* Luxury Navbar */}
        <Navbar spaSettings={spaSettings} />

        {/* Main Luxury Experience */}
        <main>
          <Hero spaSettings={spaSettings} />
          <About />
          <Services />
          <Experience />
          <Gallery />
          <Testimonials />
          <Booking spaSettings={spaSettings} />
        </main>

        {/* Editorial Footer & Floating WhatsApp */}
        <Footer spaSettings={spaSettings} />
        <WhatsAppButton spaSettings={spaSettings} />
      </div>
    </AudioProvider>
  );
}

export default App;
