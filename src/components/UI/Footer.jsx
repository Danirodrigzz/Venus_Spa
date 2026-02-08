import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Heart } from 'lucide-react';
import './Footer.css';

const Footer = ({ spaSettings }) => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h2>{spaSettings?.spaName?.toUpperCase() || 'VENUS'}</h2>
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
                            <li><MapPin size={18} /> {spaSettings?.address}</li>
                            <li><Phone size={18} /> {spaSettings?.phone}</li>

                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Venus Elegant Spa. Todos los derechos reservados.</p>
                    <p style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        Diseñado por <a href="https://daniela-rodriguez.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline', marginLeft: '5px', marginRight: '5px' }}>Daniela Rodriguez</a> con mucho amor <Heart size={16} style={{ color: '#e74c3c', fill: '#e74c3c' }} />
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
