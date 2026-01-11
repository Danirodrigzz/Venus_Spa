import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flower2, Wind, Heart, Waves, Zap, Flame, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Services.css';

const IconMap = {
    'Flower2': <Flower2 size={32} />,
    'Flame': <Flame size={32} />,
    'Zap': <Zap size={32} />,
    'Activity': <Activity size={32} />,
    'Waves': <Waves size={32} />,
    'Sparkles': <Sparkles size={32} />,
    'Heart': <Heart size={32} />,
    'Wind': <Wind size={32} />,
};

const defaultServices = [
    { icon: 'Flower2', title: "Masaje Relajante", description: "Una experiencia sublime para liberar el estrés." },
    { icon: 'Flame', title: "Masaje Tántrico", description: "Una terapia sensorial profunda." },
    { icon: 'Zap', title: "Masaje Reconstructor", description: "Ideal para dolores musculares profundos." },
    { icon: 'Activity', title: "Masaje Deportivo", description: "Mejora del rendimiento físico." },
    { icon: 'Waves', title: "Choco-Love", description: "Terapia sensorial con chocolate." },
    { icon: 'Sparkles', title: "Limpieza Facial", description: "Elimina impurezas y devuelve el brillo." },
    { icon: 'Heart', title: "Exfoliación", description: "Remoción de células muertas." },
    { icon: 'Wind', title: "Masaje 4 Manos", description: "Doble técnica y relajación simultánea." },
    { icon: 'Sparkles', title: "Manicure y Pedicure", description: "Cuidado integral para manos y pies." }
];

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                setServices(data);
            } else {
                setServices(defaultServices);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setServices(defaultServices);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="servicios" className="services">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Nuestros Servicios</span>
                    <h2 className="title">Bienestar Sin Límites</h2>
                </div>

                <div className="services-grid">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id || index}
                            className="service-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="service-icon">
                                {IconMap[service.icon_name] || IconMap[service.icon] || <Sparkles size={32} />}
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            {service.show_price && service.price && <span className="service-price">${service.price}</span>}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
