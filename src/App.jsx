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
import { supabase } from './lib/supabase'
import './index.css'

function App() {
  const [view, setView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);

      // Detectar si venimos de un correo de recuperación
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetting(true);
        setView('admin');
        window.location.hash = '#/admin';
      }
    });

    const handleHash = () => {
      const hash = window.location.hash;
      // Ser más flexible con el hash: si empieza con #/admin o contiene tokens de acceso
      if (hash.startsWith('#/admin') || hash.includes('access_token')) {
        setView('admin');
        // Si detectamos manualmente que es una recuperación de contraseña por la URL
        if (hash.includes('type=recovery')) {
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

  if (loading) return null;

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
      }}
    />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Booking />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default App
