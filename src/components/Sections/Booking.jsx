import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MessageSquare, Send } from 'lucide-react';
import './Booking.css';

const Booking = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        servicio: 'Masajes',
        fecha: '',
        hora: '',
        mensaje: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsApp = (e) => {
        e.preventDefault();
        const { nombre, servicio, fecha, hora, mensaje } = formData;
        const text = `Hola Venus Elegant Spa! Me gustaría agendar una cita.%0A%0A*Nombre:* ${nombre}%0A*Servicio:* ${servicio}%0A*Fecha:* ${fecha}%0A*Hora:* ${hora}%0A*Mensaje:* ${mensaje}`;
        window.open(`https://wa.me/18495319662?text=${text}`, '_blank');
    };

    return (
        <section id="reservas" className="booking">
            <div className="container">
                <div className="booking-wrapper glass-card">
                    <div className="booking-info">
                        <span className="subtitle">Reserva tu momento</span>
                        <h2 className="title">Agenda una Cita</h2>
                        <p>
                            Completa el formulario y nos pondremos en contacto contigo para confirmar tu reserva.
                            También puedes escribirnos directamente por WhatsApp.
                        </p>

                        <div className="contact-details">
                            <div className="detail-item">
                                <strong>Ubicación:</strong>
                                <span>Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.</span>
                            </div>
                            <div className="detail-item">
                                <strong>Email:</strong>
                                <span>venuselegantspa@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    <form className="booking-form" onSubmit={handleWhatsApp}>
                        <div className="form-group">
                            <label><User size={18} /> Nombre Completo</label>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Ej. Maria Perez"
                                required
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Servicio</label>
                                <select name="servicio" onChange={handleChange}>
                                    <option>Masajes</option>
                                    <option>Faciales</option>
                                    <option>Aromaterapia</option>
                                    <option>Manicura/Pedicura</option>
                                    <option>Depilación</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label><Calendar size={18} /> Fecha</label>
                                <input type="date" name="fecha" required onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Clock size={18} /> Hora Preferida</label>
                                <input type="time" name="hora" required onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><MessageSquare size={18} /> Mensaje (Opcional)</label>
                            <textarea
                                name="mensaje"
                                rows="3"
                                placeholder="Alguna preferencia adicional..."
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            <Send size={18} /> Enviar por WhatsApp
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Booking;
