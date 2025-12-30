import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
    return (
        <section id="nosotros" className="about">
            <div className="container about-container">
                <motion.div
                    className="about-image"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img src="/assets/sala_1.png" alt="Venus Elegant Spa Interior" />
                    <div className="about-badge glass-card">
                        <img src="/assets/logo_badge.png" alt="Venus Logo Badge" className="badge-img" />
                    </div>
                </motion.div>

                <motion.div
                    className="about-content"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <span className="subtitle">Nuestra Promesa</span>
                    <h2 className="title">Vive la <br /><span>Experiencia</span></h2>
                    <p>
                        En Venus Elegant Spa, cada detalle ha sido cuidadosamente seleccionado para
                        ofrecerte un oasis de tranquilidad en medio de la ciudad.
                    </p>
                    <p>
                        Nuestras instalaciones están diseñadas para garantizar tu privacidad y comodidad,
                        permitiéndote disfrutar de los mejores tratamientos faciales y corporales
                        en un ambiente profesional y acogedor.
                    </p>

                    <div className="about-stats">
                        <div className="stat">
                            <h3>Excelencia</h3>
                            <span>En cada detalle</span>
                        </div>
                        <div className="stat">
                            <h3>Paz</h3>
                            <span>Tu Oasis Personal</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
