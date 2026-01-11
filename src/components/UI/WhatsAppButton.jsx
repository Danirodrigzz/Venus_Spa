import React from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
    return (
        <a
            href="https://wa.me/04241145565"
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
