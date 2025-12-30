import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MessageSquare, Send, ChevronDown, MapPin, Phone, Mail } from 'lucide-react';
import './Booking.css';

const Booking = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        servicio: 'Masajes',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        mensaje: ''
    });
    const [showServices, setShowServices] = useState(false);

    const services = ["Masajes", "Faciales", "Aromaterapia", "Manicura/Pedicura", "Depilación"];

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
                                <div className="detail-icon"><MapPin size={22} /></div>
                                <div className="detail-text">
                                    <strong>Ubicación</strong>
                                    <span>Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Phone size={22} /></div>
                                <div className="detail-text">
                                    <strong>Teléfono / WhatsApp</strong>
                                    <span>+1 (849) 531-9662</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Mail size={22} /></div>
                                <div className="detail-text">
                                    <strong>Email</strong>
                                    <span>venuselegantspa@gmail.com</span>
                                </div>
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
                                <div className={`custom-select-v2 ${showServices ? 'open' : ''}`} onClick={() => setShowServices(!showServices)}>
                                    <div className="selected-value">
                                        {formData.servicio}
                                        <ChevronDown size={18} className={`chevron ${showServices ? 'rotate' : ''}`} />
                                    </div>
                                    {showServices && (
                                        <div className="options-menu">
                                            {services.map(service => (
                                                <div
                                                    key={service}
                                                    className={`option-item-v2 ${formData.servicio === service ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData({ ...formData, servicio: service });
                                                        setShowServices(false);
                                                    }}
                                                >
                                                    {service}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Calendar size={18} /> Fecha</label>
                                <div className="date-time-wrapper">
                                    <input
                                        type="date"
                                        name="fecha"
                                        required
                                        onChange={handleChange}
                                        value={formData.fecha}
                                    />
                                    <ChevronDown size={18} className="field-chevron" />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Clock size={18} /> Hora Preferida</label>
                                <div className="date-time-wrapper">
                                    <input
                                        type="time"
                                        name="hora"
                                        required
                                        onChange={handleChange}
                                        value={formData.hora}
                                    />
                                    <ChevronDown size={18} className="field-chevron" />
                                </div>
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
