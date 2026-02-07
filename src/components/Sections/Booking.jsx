import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MessageSquare, Send, ChevronDown, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Booking.css';

const Booking = ({ spaSettings: globalSettings }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        servicio: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        mensaje: ''
    });

    const [dbServices, setDbServices] = useState([]);
    const [occupiedTimes, setOccupiedTimes] = useState([]);
    const [errors, setErrors] = useState({});

    // Use global settings passed from App.jsx
    const spaSettings = globalSettings || {
        phone: '04241145565',
        address: 'Plaza Rubi Av. España #69 3er nivel, local 303 Santo Domingo, Éste.'
    };

    const [showServices, setShowServices] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Basic Spanish Bad Words List (Expandable)
    const badWords = ['puta', 'mierda', 'verga', 'estupido', 'tonto', 'idiota', 'imbecil', 'cabron', 'pendejo', 'zorra', 'maldito', 'coño', 'maricon', 'puto'];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.fecha) {
            checkAvailability(formData.fecha);
        }
    }, [formData.fecha]);

    const fetchData = async () => {
        try {
            const { data: servicesData } = await supabase.from('services').select('id, title');
            if (servicesData && servicesData.length > 0) {
                setDbServices(servicesData);
                setFormData(prev => ({ ...prev, servicio: servicesData[0].title }));
            } else {
                setFormData(prev => ({ ...prev, servicio: 'Masajes' }));
            }
        } catch (error) {
            console.error('Error fetching booking data:', error);
        }
    };

    const checkAvailability = async (dateStr) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('time')
                .eq('date', dateStr)
                .in('status', ['aprobada', 'pending', 'pendiendo', 'completada']); // Only fetch active apps

            if (error) throw error;

            const times = data.map(app => app.time.substring(0, 5)); // "10:00"
            setOccupiedTimes(times);
        } catch (err) {
            console.error("Error checking availability:", err);
        }
    };

    const containsBadWords = (text) => {
        if (!text) return false;
        const words = text.toLowerCase().split(/\s+/);
        return words.some(w => badWords.includes(w));
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'nombre':
                if (value.length < 3) error = 'El nombre es muy corto.';
                if (value.length > 50) error = 'El nombre es muy largo.';
                if (containsBadWords(value)) error = 'Lenguaje inapropiado detectado.';
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) && value.length > 0) error = 'Solo se permiten letras.';
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length > 0) error = 'Formato de correo inválido.';
                break;
            case 'telefono':
                if (/[a-zA-Z]/.test(value)) error = 'No se permiten letras en el teléfono.';
                if (!/^[0-9+\-\s]*$/.test(value) && value.length > 0) error = 'Solo números, guiones o +.';
                if (value.length > 0 && value.replace(/\D/g, '').length < 10) error = 'Mínimo 10 dígitos numéricos.';
                break;
            case 'mensaje':
                if (value.length > 300) error = 'Mensaje máximo 300 caracteres.';
                if (containsBadWords(value)) error = 'Lenguaje inapropiado detectado.';
                break;
            case 'fecha':
                const today = new Date().toISOString().split('T')[0];
                if (value < today) error = 'No puedes agendar en el pasado.';
                break;
            case 'hora':
                if (occupiedTimes.includes(value)) error = 'Este horario ya está reservado.';
                // Simple business hours check (adjust as needed)
                const hourNum = parseInt(value.split(':')[0]);
                if (hourNum < 8 || hourNum > 20) error = 'Horario fuera de servicio (8am - 8pm).';
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Strict blocking for letters in phone
        if (name === 'telefono' && /[a-zA-Z]/.test(value)) {
            return; // Don't update state
        }

        setFormData({ ...formData, [name]: value });

        // Real-time validation
        const err = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation on Submit
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key]);
            if (err) newErrors[key] = err;
        });

        // Extra check for availability at submit time
        if (occupiedTimes.includes(formData.hora)) {
            newErrors.hora = 'Lo sentimos, este horario acaba de ser ocupado.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedService = dbServices.find(s => s.title === formData.servicio);
            let finalStatus = 'pending';

            if (spaSettings.autoApprove) {
                const { count } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_name', formData.nombre);

                if (count >= 10) finalStatus = 'aprobada';
            }

            // Append contact info to message for DB storage (assuming DB cols missing)
            const dbMessage = `[Tel: ${formData.telefono} | Email: ${formData.email}] ${formData.mensaje}`;

            const { error } = await supabase
                .from('appointments')
                .insert([{
                    client_name: formData.nombre,
                    service_id: selectedService ? selectedService.id : null,
                    date: formData.fecha,
                    time: formData.hora,
                    message: dbMessage,
                    status: finalStatus
                }]);

            if (error) throw error;

            const text = `¡Hola Venus Elegant Spa! Me gustaría agendar una cita.%0A%0A*Nombre:* ${formData.nombre}%0A*Tel:* ${formData.telefono}%0A*Email:* ${formData.email}%0A*Servicio:* ${formData.servicio}%0A*Fecha:* ${formData.fecha}%0A*Hora:* ${formData.hora}${formData.mensaje ? `%0A*Mensaje:* ${formData.mensaje}` : ''}`;

            setIsSuccess(true);

            setTimeout(() => {
                window.open(`https://wa.me/${spaSettings.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
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
                        <button className="btn btn-primary" onClick={() => { setIsSuccess(false); setFormData({ ...formData, mensaje: '', hora: '10:00' }); }}>Agendar otra cita</button>
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
                            Completa el formulario y verificaremos tu horario al instante.
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
                                maxLength={50}
                                value={formData.nombre}
                                onChange={handleChange}
                                className={errors.nombre ? 'input-error' : ''}
                            />
                            {errors.nombre && <span className="error-msg">{errors.nombre}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><MessageSquare size={18} /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="ejemplo@correo.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'input-error' : ''}
                                />
                                {errors.email && <span className="error-msg">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label><Phone size={18} /> Teléfono</label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    placeholder="0412-123-4567"
                                    required
                                    maxLength={15}
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className={errors.telefono ? 'input-error' : ''}
                                />
                                {errors.telefono && <span className="error-msg">{errors.telefono}</span>}
                            </div>
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
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleChange}
                                        value={formData.fecha}
                                        className={errors.fecha ? 'input-error' : ''}
                                    />
                                    <ChevronDown size={18} className="field-chevron" />
                                </div>
                                {errors.fecha && <span className="error-msg">{errors.fecha}</span>}
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
                                        className={errors.hora ? 'input-error' : ''}
                                    />
                                    <ChevronDown size={18} className="field-chevron" />
                                </div>
                                {errors.hora && <span className="error-msg">{errors.hora}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><MessageSquare size={18} /> Mensaje (Opcional)</label>
                            <textarea
                                name="mensaje"
                                rows="3"
                                maxLength={300}
                                placeholder="Alguna preferencia adicional..."
                                value={formData.mensaje}
                                onChange={handleChange}
                                className={errors.mensaje ? 'input-error' : ''}
                            ></textarea>
                            {errors.mensaje && <span className="error-msg">{errors.mensaje}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting || Object.values(errors).some(x => x)}>
                            {isSubmitting ? 'Verificando...' : <><Send size={18} /> Confirmar Cita</>}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Booking;
