import React from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import './WhatsAppButton.css';

const WhatsAppButton = ({ spaSettings }) => {
    const cleanPhone = spaSettings?.phone?.replace(/[^0-9]/g, '') || '04241145565';

    return (
        <a
            href={`https://wa.me/${cleanPhone}`}
            className="whatsapp-float"
            target="_blank"
            rel="noopener noreferrer"
        >
            <IconBrandWhatsapp stroke={1.5} />
            <span className="tooltip">Chatea con nosotros</span>
        </a>
    );
};

export default WhatsAppButton;
