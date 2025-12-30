import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
    return (
        <section id="inicio" className="hero">
            <div className="hero-overflow">
                <motion.div
                    className="hero-bg"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{ backgroundImage: `url('/assets/portada.png')` }}
                />
            </div>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <span className="hero-subtitle">Venus Elegant Spa</span>
                    <h1 className="hero-title">
                        Vive la <br />
                        <span>Experiencia</span>
                    </h1>
                    <p className="hero-description">
                        Descubre una experiencia rejuvenecedora diseñada para elevar tus sentidos
                        y restaurar tu armonía interior en el corazón de Santo Domingo Este.
                    </p>
                    <div className="hero-btns">
                        <a href="#reservas" className="btn btn-primary">Reservar Ahora</a>
                        <a href="#servicios" className="btn btn-outline">Ver Servicios</a>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="hero-circle"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 8, repeat: Infinity }}
            />
        </section>
    );
};

export default Hero;
