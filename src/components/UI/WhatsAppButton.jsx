import React from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import './WhatsAppButton.css';

const WhatsAppButton = ({ spaSettings }) => {
  const cleanPhone = (spaSettings?.phone || '8493164217').replace(/[^0-9]/g, '');
  const greeting = encodeURIComponent('¡Hola Venus Elegant Spa! Deseo consultar sobre disponibilidad.');

  return (
    <aside className="whatsapp-floating-wrap" aria-label="Atención por WhatsApp">
      <a
        href={`https://wa.me/${cleanPhone}?text=${greeting}`}
        className="whatsapp-circle-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <IconBrandWhatsapp stroke={1.5} size={20} className="whatsapp-icon" />
        <span className="whatsapp-hover-pill">WhatsApp</span>
      </a>
    </aside>
  );
};

export default WhatsAppButton;
