import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const navLinks = [
  { name: 'Nosotros', href: '#nosotros', sectionId: 'nosotros' },
  { name: 'Tratamientos', href: '#servicios', sectionId: 'servicios' },
  { name: 'El Ritual', href: '#experiencia', sectionId: 'experiencia' },
  { name: 'Espacios', href: '#galeria', sectionId: 'galeria' },
  { name: 'Opiniones', href: '#testimonios', sectionId: 'testimonios' },
];

const Navbar = ({ spaSettings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('inicio');

  // Bloquear scroll de página cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  // Detección de scroll: ocultar al bajar, reaparecer al subir
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY && currentScrollY > 100 && !isMenuOpen) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMenuOpen]);

  // Observer para detectar el tema (dark/light) y la sección activa
  useEffect(() => {
    const sections = document.querySelectorAll('section[data-theme]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute('data-theme') || 'light';
            setCurrentTheme(theme);
            if (entry.target.id) {
              setActiveSection(entry.target.id);
            }
          }
        });
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`navbar-floating-header ${isScrolled ? 'is-scrolled' : 'is-at-top'} ${
          !isVisible ? 'is-hidden' : ''
        } theme-${currentTheme}`}
      >
        <div className="navbar-floating-inner container">
          {/* 1. Logo a la izquierda, limpio y sin fondo */}
          <div className="nav-side-brand">
            <a href="#inicio" className="brand-wordmark" aria-label="Venus Elegant Spa">
              <span className="brand-wordmark-title">VENUS</span>
              <span className="brand-wordmark-sub">ELEGANT SPA</span>
            </a>
          </div>

          {/* 2. Menú recogido en una pequeña píldora de vidrio esmerilado centrada */}
          <nav className="nav-center-pill-wrap" aria-label="Navegación principal">
            <div className="nav-floating-pill">
              {navLinks.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`nav-pill-link ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="pill-link-label">{link.name}</span>
                    {isActive && (
                      <motion.span
                        className="pill-active-dot"
                        layoutId="navActiveDot"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          </nav>

          {/* 3. Botón 'Reservar' separado a la derecha */}
          <div className="nav-side-cta">
            <a href="#reservas" className="btn-reserva-copper">
              <span className="btn-reserva-text">Reservar</span>
              <ArrowUpRight size={13} className="btn-reserva-arrow" />
            </a>

            {/* Disparador móvil */}
            <button
              type="button"
              className={`mobile-hamburger-btn ${isMenuOpen ? 'is-active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Cerrar Menú' : 'Abrir Menú'}
              aria-expanded={isMenuOpen}
            >
              <span className="hamb-line line-top" />
              <span className="hamb-line line-bottom" />
            </button>
          </div>
        </div>
      </header>

      {/* Menú a Pantalla Completa en Móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-fullscreen-overlay"
            initial={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-overlay-top container">
              <span className="mobile-brand">VENUS</span>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Cerrar Menú"
              >
                <span className="close-line line-1" />
                <span className="close-line line-2" />
              </button>
            </div>

            <nav className="mobile-nav-body container">
              {navLinks.map((link, idx) => (
                <div key={link.name} className="mobile-link-mask">
                  <motion.a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-monumental-link"
                    initial={{ y: '115%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      delay: 0.12 + idx * 0.07,
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="mobile-label"><em>{link.name}</em></span>
                  </motion.a>
                </div>
              ))}

              <div className="mobile-link-mask" style={{ marginTop: '28px' }}>
                <motion.a
                  href="#reservas"
                  onClick={() => setIsMenuOpen(false)}
                  className="mobile-reserve-cta"
                  initial={{ y: '115%' }}
                  animate={{ y: '0%' }}
                  transition={{ delay: 0.5, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span>Reservar Cita Privada</span>
                  <ArrowUpRight size={16} />
                </motion.a>
              </div>
            </nav>

            <div className="mobile-overlay-bottom container">
              <p className="mobile-info-item">
                {spaSettings?.address || 'Plaza Rubi Av. España #69 3er nivel, Santo Domingo Este'}
              </p>
              <p className="mobile-info-phone">
                {spaSettings?.phone || '+1 (849) 316-4217'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
