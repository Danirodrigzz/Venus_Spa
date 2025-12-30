import React from 'react';
import { motion } from 'framer-motion';
import './Gallery.css';

const Gallery = () => {
    const images = [
        { src: '/assets/portada.png', alt: 'Nuestra Sala Principal' },
        { src: '/assets/sala_1.png', alt: 'Ambiente de Masajes' },
        { src: '/assets/pasillo_v2.png', alt: 'Pasillo de Relax' },
        { src: '/assets/sala_2.png', alt: 'Instalaciones Confortables' },
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
                            <img src={img.src} alt={img.alt} />
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
