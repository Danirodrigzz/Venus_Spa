import React from 'react';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h2>VENUS</h2>
                        <p>Elegancia y relajación en cada detalle. Tu escape perfecto en Santo Domingo.</p>
                        <div className="footer-social">
                            <a href="https://www.facebook.com/share/1EYpX7UvDV/" target="_blank" rel="noreferrer"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/venuselegantspa?igsh=MTBxYmJzcGIweGxlNA==" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h3>Enlaces</h3>
                        <ul>
                            <li><a href="#inicio">Inicio</a></li>
                            <li><a href="#servicios">Servicios</a></li>
                            <li><a href="#nosotros">Nosotros</a></li>
                            <li><a href="#galeria">Galería</a></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h3>Contacto</h3>
                        <ul>
                            <li><MapPin size={18} /> Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este</li>
                            <li><Phone size={18} /> +1 (849) 531-9662</li>
                            <li><Mail size={18} /> venuselegantspa@gmail.com</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Venus Elegant Spa. Todos los derechos reservados.</p>
                    <p style={{ marginTop: '10px' }}>
                        Diseñado por <a href="https://portafolio-rust-eight.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>portafolio-rust-eight.vercel.app</a> con mucho amor
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
