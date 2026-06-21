import React from 'react';
import { motion } from 'framer-motion';
import './Gallery.css';

const Gallery = () => {
    const images = [
        { src: '/assets/spa.mp4', alt: 'Recorrido en Video' },
        { src: '/assets/recepcion_1.jpeg', alt: 'Nuestra Recepción' },
        { src: '/assets/recepcion_4.jpeg', alt: 'Detalles de Nuestra Entrada' },
        { src: '/assets/portada.png', alt: 'Sala de Masajes Principal' },
        { src: '/assets/sala_2.png', alt: 'Instalaciones Confortables' },
        { src: '/assets/spa1.jpeg', alt: 'Relax en Spa' },
        { src: '/assets/spa2.jpeg', alt: 'Instalaciones de Spa' },
        { src: '/assets/spa3.jpeg', alt: 'Ambiente Spa' },
    ];

    return (
        <section id="galeria" className="gallery">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Explora Venus</span>
                    <h2 className="title">Espacios Diseñados para Ti</h2>
                </div>

                <div className="gallery-grid">
                    {images.map((img, index) => (
                        <motion.div
                            key={index}
                            className={`gallery-item item-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {img.src.endsWith('.mp4') ? (
                                <video src={img.src} autoPlay loop muted playsInline />
                            ) : (
                                <img src={img.src} alt={img.alt} />
                            )}
                            <div className="image-overlay">
                                <span>{img.alt}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
