import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flower2, Wind, Heart, Waves, Zap, Flame, Activity } from 'lucide-react';
import './Services.css';

const services = [
    {
        icon: <Flower2 size={32} />,
        title: "Masaje Relajante",
        description: "Una experiencia sublime para liberar el estrés y relajar cada músculo."
    },
    {
        icon: <Flame size={32} />,
        title: "Masaje Tántrico",
        description: "Una terapia sensorial profunda diseñada para conectar con tu energía vital."
    },
    {
        icon: <Zap size={32} />,
        title: "Masaje Reconstructor",
        description: "Ideal para dolores musculares profundos y recuperación física."
    },
    {
        icon: <Activity size={32} />,
        title: "Masaje Deportivo",
        description: "Enfocado en la recuperación muscular y mejora del rendimiento físico."
    },
    {
        icon: <Waves size={32} />,
        title: "Choco-Love",
        description: "Terapia sensorial con chocolate para hidratar y revitalizar la piel."
    },
    {
        icon: <Sparkles size={32} />,
        title: "Limpieza Facial Profunda",
        description: "Elimina impurezas y devuelve el brillo natural a tu rostro."
    },
    {
        icon: <Heart size={32} />,
        title: "Exfoliación Corporal",
        description: "Remoción de células muertas para una piel suave y renovada."
    },
    {
        icon: <Wind size={32} />,
        title: "Masaje 4 Manos",
        description: "Doble técnica y relajación simultánea para una experiencia inigualable."
    }
];

const Services = () => {
    return (
        <section id="servicios" className="services">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Nuestros Servicios</span>
                    <h2 className="title">Bienestar Sin Límites</h2>
                </div>

                <div className="services-grid">
                    {services.map((item, index) => (
                        <motion.div
                            key={index}
                            className="service-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="service-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
