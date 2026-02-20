import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, Facebook } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo">
          {isScrolled && <img src="/assets/logo_large.png" alt="Venus Elegant Spa" className="nav-logo-img" />}
        </div>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#inicio" onClick={() => setIsMenuOpen(false)}>Inicio</a>
          <a href="#servicios" onClick={() => setIsMenuOpen(false)}>Servicios</a>
          <a href="#nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</a>
          <a href="#galeria" onClick={() => setIsMenuOpen(false)}>Galería</a>
          <a href="#reservas" className="btn-reserva" onClick={() => setIsMenuOpen(false)}>Agendar</a>

          <div className="social-mobile">
            <a href="https://www.facebook.com/share/1EYpX7UvDV/" target="_blank" rel="noreferrer"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/venuselegantspa?igsh=MTBxYmJzcGIweGxlNA==" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
          </div>
        </div>

        <div className="nav-actions">
          <div className="social-desktop">
            <a href="https://www.facebook.com/share/1EYpX7UvDV/" target="_blank" rel="noreferrer">
              <Facebook size={18} className="social-icon" />
            </a>
            <a href="https://www.instagram.com/venuselegantspa?igsh=MTBxYmJzcGIweGxlNA==" target="_blank" rel="noreferrer">
              <Instagram size={18} className="social-icon" />
            </a>
          </div>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
