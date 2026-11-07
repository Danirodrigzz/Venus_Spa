import React from 'react';
import { ArrowUp, Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';
import './Footer.css';

const Footer = ({ spaSettings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const address = spaSettings?.address || 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este';
  const rawPhone = spaSettings?.phone || '+1 (849) 316-4217';
  // Formato legible para visualización
  const displayPhone = '+1 (849) 316-4217';
  const telHref = `tel:${rawPhone.replace(/[^0-9+]/g, '')}`;

  return (
    <footer className="footer-luxury" id="contacto">
      <div className="container footer-luxury-container">
        {/* Fila principal de 3 columnas */}
        <div className="footer-columns-grid">
          {/* Columna 1: Marca y Ubicación */}
          <div className="footer-col-about">
            <span className="footer-section-kicker">VENUS ELEGANT SPA</span>
            <p className="footer-brand-desc">
              Santuario de masajes y bienestar integral en Santo Domingo Este.
              Privacidad absoluta, confort acústico y serenidad profunda.
            </p>
            <div className="footer-location-block">
              <div className="footer-meta-item">
                <MapPin size={15} className="footer-meta-icon" />
                <span>{address}</span>
              </div>
              <div className="footer-meta-item">
                <Phone size={15} className="footer-meta-icon" />
                <a href={telHref} className="footer-phone-link">
                  {displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div className="footer-col-links">
            <span className="footer-section-kicker">NAVEGACIÓN</span>
            <ul className="footer-nav-list">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#nosotros">Nosotros</a></li>
              <li><a href="#servicios">Tratamientos</a></li>
              <li><a href="#experiencia">El Ritual</a></li>
              <li><a href="#galeria">Espacios</a></li>
              <li><a href="#testimonios">Opiniones</a></li>
              <li><a href="#reservas">Reservar Cita</a></li>
            </ul>
          </div>

          {/* Columna 3: Horarios y Redes Sociales */}
          <div className="footer-col-contact">
            <span className="footer-section-kicker">HORARIO Y REDES</span>
            
            <div className="footer-schedule-box">
              <span className="footer-sub-kicker">ATENCIÓN PERSONALIZADA</span>
              <div className="footer-schedule-detail">
                <Clock size={15} className="footer-meta-icon" />
                <span>Lunes a Sábado — 9:00 a 19:00</span>
              </div>
            </div>

            <div className="footer-social-pill-group">
              <a
                href="https://www.instagram.com/venuselegantspa?igsh=MTBxYmJzcGIweGxlNA=="
                target="_blank"
                rel="noreferrer"
                className="footer-social-pill"
                aria-label="Instagram de Venus Elegant Spa"
              >
                <Instagram size={14} />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/share/1EYpX7UvDV/"
                target="_blank"
                rel="noreferrer"
                className="footer-social-pill"
                aria-label="Facebook de Venus Elegant Spa"
              >
                <Facebook size={14} />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Separador arquitectónico con marca y botón volver arriba */}
        <div className="footer-mid-brand-strip">
          <div className="footer-brand-signature">
            <span>VENUS ELEGANT SPA</span>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="footer-scroll-top-btn"
            aria-label="Volver al inicio de la página"
          >
            <span>Volver arriba</span>
            <ArrowUp size={14} />
          </button>
        </div>

        {/* Barra inferior centrada y limpia (sin solapamiento con WhatsApp) */}
        <div className="footer-bottom-legal">
          <p className="footer-copy-text">
            © {new Date().getFullYear()} Venus Elegant Spa. Santo Domingo Este, República Dominicana. Todos los derechos reservados.
          </p>
          <p className="footer-designer-credit">
            Diseño por{' '}
            <a
              href="https://daniela-rodriguez.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="footer-designer-link"
            >
              Daniela Rodriguez
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
