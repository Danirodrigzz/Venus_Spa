import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MessageSquare, Send, ChevronDown, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Booking.css';

const Booking = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        servicio: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        mensaje: ''
    });

    const [dbServices, setDbServices] = useState([]);
    const [spaSettings, setSpaSettings] = useState({
        phone: '04241145565',
        address: 'Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.',
        email: 'venuselegantspa@gmail.com'
    });

    const [showServices, setShowServices] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Services
            const { data: servicesData } = await supabase.from('services').select('id, title');
            if (servicesData && servicesData.length > 0) {
                setDbServices(servicesData);
                setFormData(prev => ({ ...prev, servicio: servicesData[0].title }));
            } else {
                setFormData(prev => ({ ...prev, servicio: 'Masajes' }));
            }

            // Fetch Settings
            const { data: settingsData } = await supabase.from('settings').select('*').single();
            if (settingsData) {
                setSpaSettings({
                    phone: settingsData.phone.replace(/[^0-9]/g, ''),
                    address: settingsData.address,
                    email: settingsData.email
                });
            }
        } catch (error) {
            console.error('Error fetching booking data:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const selectedService = dbServices.find(s => s.title === formData.servicio);

            // 1. Guardar en Base de Datos
            const { error } = await supabase
                .from('appointments')
                .insert([{
                    client_name: formData.nombre,
                    service_id: selectedService ? selectedService.id : null,
                    date: formData.fecha,
                    time: formData.hora,
                    message: formData.mensaje,
                    status: 'pending'
                }]);

            if (error) throw error;

            // 2. Preparar mensaje de WhatsApp
            const text = `¡Hola Venus Elegant Spa! Me gustaría agendar una cita.%0A%0A*Nombre:* ${formData.nombre}%0A*Servicio:* ${formData.servicio}%0A*Fecha:* ${formData.fecha}%0A*Hora:* ${formData.hora}${formData.mensaje ? `%0A*Mensaje:* ${formData.mensaje}` : ''}`;

            setIsSuccess(true);

            // Pequeño retardo para que el usuario vea el éxito antes de redirigir
            setTimeout(() => {
                window.open(`https://wa.me/${spaSettings.phone}?text=${text}`, '_blank');
                setIsSubmitting(false);
            }, 1500);

        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Hubo un error al procesar tu cita. Por favor intenta de nuevo.');
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <section id="reservas" className="booking">
                <div className="container">
                    <motion.div
                        className="booking-wrapper glass-card success-message"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <CheckCircle2 size={80} color="#10b981" />
                        <h2>¡Cita Registrada!</h2>
                        <p>Tu solicitud ha sido enviada con éxito. Te estamos redirigiendo a WhatsApp para finalizar la confirmación.</p>
                        <button className="btn btn-primary" onClick={() => setIsSuccess(false)}>Agendar otra cita</button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="reservas" className="booking">
            <div className="container">
                <div className="booking-wrapper glass-card">
                    <div className="booking-info">
                        <span className="subtitle">Reserva tu momento</span>
                        <h2 className="title">Agenda una Cita</h2>
                        <p>
                            Completa el formulario y guardaremos tu espacio automáticamente.
                            También te enviaremos a WhatsApp para una respuesta más rápida.
                        </p>

                        <div className="contact-details">
                            <div className="detail-item">
                                <div className="detail-icon"><MapPin size={22} /></div>
                                <div className="detail-text">
                                    <strong>Ubicación</strong>
                                    <span>{spaSettings.address}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Phone size={22} /></div>
                                <div className="detail-text">
                                    <strong>Teléfono / WhatsApp</strong>
                                    <span>{spaSettings.phone}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Mail size={22} /></div>
                                <div className="detail-text">
                                    <strong>Email</strong>
                                    <span>{spaSettings.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><User size={18} /> Nombre Completo</label>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Ej. Maria Perez"
                                required
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Servicio</label>
                                <div className={`custom-select-v2 ${showServices ? 'open' : ''}`} onClick={() => setShowServices(!showServices)}>
                                    <div className="selected-value">
                                        {formData.servicio || 'Selecciona un servicio'}
                                        <ChevronDown size={18} className={`chevron ${showServices ? 'rotate' : ''}`} />
                                    </div>
                                    {showServices && (
                                        <div className="options-menu">
                                            {(dbServices.length > 0 ? dbServices.map(s => s.title) : ["Masajes", "Faciales", "Manicure y Pedicure", "Otros"]).map(service => (
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
                                value={formData.mensaje}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'Procesando...' : <><Send size={18} /> Confirmar Cita</>}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Booking;
