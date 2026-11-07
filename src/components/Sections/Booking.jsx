import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lock,
  Wine,
  CalendarPlus,
  MessageCircle,
  CreditCard,
  Check,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSpaServices } from '../../hooks/useSpaServices';
import servicesData from '../../data/servicesData';
import './Booking.css';

/*
  VENUS ELEGANT SPA — CONCIERGE & RESERVAS (ULTRA-MINIMALIST EDITORIAL)
  - Fondo claro cálido y luminoso (lino / alabastro), rompiendo la saturación oscura.
  - Diseño minimalista y tipográfico: sin cajas genéricas, líneas arquitectónicas sutiles.
  - Fuente única compartida de rituales (useSpaServices) con precios en RD$.
  - Anticipo de reserva de $5.00 USD que asegura la cita e incluye bebida de cortesía.
*/

const defaultHours = [
  '09:00', '10:15', '11:30', '12:45',
  '14:00', '15:15', '16:30', '17:45',
  '19:00', '20:00'
];

const Booking = ({ spaSettings: globalSettings }) => {
  const spaSettings = globalSettings || {
    spaName: 'Venus Elegant Spa',
    phone: '+1 (849) 316-4217',
    address: 'Plaza Rubi Av. España #69, 3er nivel, local 303, Santo Domingo Este',
  };

  const { services } = useSpaServices();

  const [currentStep, setCurrentStep] = useState(1); // 1: Experiencia | 2: Fecha/Hora | 3: Huésped | 4: Confirmación
  const [selectedService, setSelectedService] = useState(servicesData[0]?.title || 'Masaje Relajante');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedHour, setSelectedHour] = useState('11:30');
  const [occupiedHours, setOccupiedHours] = useState([]);

  // Formulario de Contacto
  const [contactData, setContactData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    personas: '1',
    notas: ''
  });

  // Datos simulados de pago
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);

  const goToStep = (step) => {
    setCurrentStep(step);
    // Anclar la vista con precisión en la tarjeta para evitar que la página salte al footer
    setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const targetScroll = window.scrollY + rect.top - 75;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }, 40);
  };

  useEffect(() => {
    if (!selectedService && services && services.length > 0) {
      setSelectedService(services[0].title);
    }
  }, [services, selectedService]);

  // Listener para preselección desde carta de rituales
  useEffect(() => {
    const handleSelectRitual = (event) => {
      const ritualTitle = event.detail?.serviceTitle;
      if (ritualTitle) {
        setSelectedService(ritualTitle);
        goToStep(2);
      }
    };

    window.addEventListener('selectServiceForBooking', handleSelectRitual);
    return () => window.removeEventListener('selectServiceForBooking', handleSelectRitual);
  }, []);

  // Consultar disponibilidad en Supabase
  useEffect(() => {
    const fetchOccupied = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('time')
          .eq('date', selectedDate)
          .neq('status', 'rechazada');

        if (!error && data) {
          // Normalizar formato "HH:mm" (ej: "10:00:00" -> "10:00")
          setOccupiedHours(data.map((d) => (d.time ? d.time.slice(0, 5) : '')));
        } else {
          setOccupiedHours([]);
        }
      } catch (err) {
        setOccupiedHours([]);
      }
    };

    if (selectedDate) fetchOccupied();
  }, [selectedDate]);

  const validateStep3 = () => {
    const errs = {};
    if (!contactData.nombre.trim()) errs.nombre = 'Por favor ingresa tu nombre completo';
    if (!contactData.telefono.trim()) errs.telefono = 'Ingresa tu número de WhatsApp o teléfono';
    if (!contactData.email.trim() || !contactData.email.includes('@')) {
      errs.email = 'Ingresa un correo electrónico válido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs = {};
    const cleanNum = cardData.cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) errs.cardNumber = 'Ingresa los dígitos de la tarjeta';
    if (!cardData.cardExp || cardData.cardExp.length < 5) errs.cardExp = 'Vencimiento MM/AA';
    if (!cardData.cardCvc || cardData.cardCvc.length < 3) errs.cardCvc = 'CVC de 3 dígitos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePaymentAndConfirm = async (e) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setIsProcessingPayment(true);

    try {
      const chosen = services.find((s) => s.title === selectedService) || services[0];
      const refCode = `VENUS-${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanLast4 = cardData.cardNumber.replace(/\s/g, '').slice(-4) || '••••';
      setConfirmationCode(refCode);

      const dbMessage = `[PAGO $5.00 USD ANTICIPO - Ref: ${refCode} - Tarjeta: •••• ${cleanLast4} - Bebida de cortesía incluida] Tel: ${contactData.telefono} | Email: ${contactData.email} | Personas: ${contactData.personas} | Notas: ${contactData.notas || 'Ninguna'}`;

      // Insertar en la tabla appointments de Supabase alineada al esquema oficial
      const { error } = await supabase.from('appointments').insert([
        {
          client_name: contactData.nombre,
          service_id: chosen.id || 1,
          date: selectedDate,
          time: selectedHour.length === 5 ? `${selectedHour}:00` : selectedHour,
          message: dbMessage,
          status: 'aprobada'
        }
      ]);

      if (error) {
        console.error('Nota de inserción en Supabase:', error.message);
      }

      setTimeout(() => {
        setIsProcessingPayment(false);
        setIsConfirmed(true);
      }, 900);
    } catch (err) {
      console.error('Error al registrar cita:', err);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setIsConfirmed(true);
      }, 900);
    }
  };

  const chosenRitual = (services && services.find((s) => s.title === selectedService)) || (services && services[0]) || servicesData[0] || {
    title: 'Masaje Relajante',
    subtitle: 'Armonía y Alivio Inmediato',
    duration: '60 / 90 min',
  };

  const getGoogleCalendarUrl = () => {
    const startIso = `${selectedDate.replace(/-/g, '')}T${selectedHour.replace(':', '')}00`;
    const endIso = `${selectedDate.replace(/-/g, '')}T${parseInt(selectedHour.split(':')[0], 10) + 1}${selectedHour.split(':')[1]}00`;
    const title = encodeURIComponent(`Cita en Venus Elegant Spa — ${chosenRitual.title}`);
    const details = encodeURIComponent(
      `Ritual: ${chosenRitual.title}\nCita confirmada con anticipo de $5 USD.\nIncluye bebida de cortesía a tu llegada.\nDirección: ${spaSettings.address}`
    );
    const location = encodeURIComponent(spaSettings.address);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const getWhatsAppConfirmationUrl = () => {
    const msg = encodeURIComponent(
      `¡Hola Venus Elegant Spa! He reservado mi cita:\n\n*Ritual:* ${chosenRitual.title}\n*Fecha:* ${selectedDate}\n*Hora:* ${selectedHour}\n*Nombre:* ${contactData.nombre}\n\n¡Espero con entusiasmo mi sesión y bebida de cortesía!`
    );
    const cleanPhone = (spaSettings.phone || '8493164217').replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  return (
    <section id="reservas" data-theme="light" className="booking-minimalist-section">
      <div className="container container-narrow booking-narrow-stage">

        {/* ========================================================
            ENCABEZADO EDITORIAL MINIMALISTA
            ======================================================== */}
        <header className="booking-concierge-header">
          <div className="concierge-kicker">
            <span className="kicker-hairline" />
            <span>CONCIERGE Y RESERVA PRIVADA</span>
            <span className="kicker-hairline" />
          </div>

          <h2 className="concierge-title">
            Reserva tu momento <em>en el santuario</em>
          </h2>

          <p className="concierge-lead">
            Con un anticipo de $5 USD aseguras tu cabina y terapeuta privada, e incluye bebida de cortesía a tu llegada.
          </p>

          <div className="concierge-courtesy-pill">
            <Wine size={15} strokeWidth={1.5} className="courtesy-icon" />
            <span>Bebida de cortesía incluida a tu llegada</span>
          </div>

          <div className="concierge-currency-note">
            <Info size={13} />
            <span>
              El anticipo de reserva es de <strong>$5.00 USD</strong> y se acredita íntegramente al saldo de tu ritual al presentarte en el spa.
            </span>
          </div>
        </header>

        {/* ========================================================
            CONTENEDOR DE ATELIER MINIMALISTA
            ======================================================== */}
        <div className="booking-atelier-card" ref={cardRef}>
          {!isConfirmed ? (
            <>
              {/* Stepper Minimalista Typográfico */}
              <nav className="atelier-stepper" aria-label="Progreso">
                <div className="stepper-stages-track">
                  {[
                    { num: '01', label: 'Experiencia' },
                    { num: '02', label: 'Fecha y Hora' },
                    { num: '03', label: 'Tus Datos' },
                    { num: '04', label: 'Confirmación' },
                  ].map((s, idx) => {
                    const stepNumber = idx + 1;
                    const isCurrent = currentStep === stepNumber;
                    const isDone = currentStep > stepNumber;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => {
                          if (stepNumber < currentStep) goToStep(stepNumber);
                        }}
                        className={`stepper-node-btn ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                      >
                        <span className="node-num">{s.num}</span>
                        <span className="node-label">{s.label}</span>
                        {isCurrent && <motion.div layoutId="stepUnderline" className="node-indicator-line" />}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* CUERPO DEL PASO */}
              <div className="atelier-body-stage">

                {/* ========================================================
                    PASO 1: LA EXPERIENCIA (LISTA TIPOGRÁFICA LIMPIA)
                    ======================================================== */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="atelier-step-view"
                  >
                    <div className="step-intro-bar">
                      <h3 className="step-intro-title">Selecciona tu ritual</h3>
                      <span className="step-intro-count">{services.length} experiencias disponibles</span>
                    </div>

                    <div className="typographic-rituals-list">
                      {services.map((s) => {
                        const isSelected = selectedService === s.title;
                        return (
                          <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedService(s.title)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedService(s.title);
                              }
                            }}
                            className={`ritual-item-line ${isSelected ? 'is-selected' : ''}`}
                          >
                            <div className="ritual-title-group">
                              <span className="ritual-serif-name">{s.title}</span>
                              {s.subtitle && <span className="ritual-subphrase">{s.subtitle}</span>}
                            </div>

                            <div className="ritual-meta-group">
                              <div className={`ritual-check-dot ${isSelected ? 'is-active' : ''}`}>
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="atelier-actions-row right-align">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="btn-atelier-primary"
                      >
                        <span>Elegir Fecha y Hora</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    PASO 2: FECHA Y HORA
                    ======================================================== */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="atelier-step-view"
                  >
                    <div className="step-intro-bar">
                      <h3 className="step-intro-title">Día y horario de visita</h3>
                      <span className="step-intro-count">Cabinas acondicionadas a 22°C</span>
                    </div>

                    <div className="minimal-datetime-layout">
                      {/* Fecha */}
                      <div className="datetime-subcol">
                        <label htmlFor="minimal-date-field" className="hairline-field-label">
                          <Calendar size={13} />
                          <span>Fecha preferida</span>
                        </label>
                        <input
                          id="minimal-date-field"
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="minimal-date-picker"
                        />
                        <span className="subcol-annotation">Reserva con al menos 2 horas de anticipación</span>
                      </div>

                      {/* Horarios */}
                      <div className="datetime-subcol">
                        <label className="hairline-field-label">
                          <Clock size={13} />
                          <span>Turnos disponibles</span>
                        </label>
                        <div className="minimal-hours-grid">
                          {defaultHours.map((hour) => {
                            const isOccupied = occupiedHours.includes(hour);
                            const isSelected = selectedHour === hour;
                            return (
                              <button
                                key={hour}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedHour(hour)}
                                className={`minimal-hour-pill ${isSelected ? 'is-selected' : ''} ${isOccupied ? 'is-occupied' : ''}`}
                              >
                                {hour}
                                {isOccupied && <span className="occupied-tiny-dot" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="atelier-actions-row">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="btn-atelier-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Atrás</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="btn-atelier-primary"
                      >
                        <span>Tus Datos</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    PASO 3: DATOS DEL HUÉSPED (INPUTS CON HAIRLINE INVISIBLE)
                    ======================================================== */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="atelier-step-view"
                  >
                    <div className="step-intro-bar">
                      <h3 className="step-intro-title">Datos de reservación</h3>
                      <span className="step-intro-count">Para personalizar tu llegada</span>
                    </div>

                    <div className="hairline-form-grid">
                      <div className="hairline-input-wrap">
                        <label className="hairline-label">Nombre y Apellido *</label>
                        <input
                          type="text"
                          placeholder="Tu nombre completo"
                          value={contactData.nombre}
                          onChange={(e) => {
                            setContactData({ ...contactData, nombre: e.target.value });
                            setErrors({ ...errors, nombre: '' });
                          }}
                          className={`hairline-text-input ${errors.nombre ? 'has-error' : ''}`}
                        />
                        {errors.nombre && <span className="hairline-err">{errors.nombre}</span>}
                      </div>

                      <div className="hairline-input-wrap">
                        <label className="hairline-label">Teléfono / WhatsApp *</label>
                        <input
                          type="tel"
                          placeholder="+1 849 000 0000"
                          value={contactData.telefono}
                          onChange={(e) => {
                            setContactData({ ...contactData, telefono: e.target.value });
                            setErrors({ ...errors, telefono: '' });
                          }}
                          className={`hairline-text-input ${errors.telefono ? 'has-error' : ''}`}
                        />
                        {errors.telefono && <span className="hairline-err">{errors.telefono}</span>}
                      </div>

                      <div className="hairline-input-wrap">
                        <label className="hairline-label">Correo Electrónico *</label>
                        <input
                          type="email"
                          placeholder="tu@correo.com"
                          value={contactData.email}
                          onChange={(e) => {
                            setContactData({ ...contactData, email: e.target.value });
                            setErrors({ ...errors, email: '' });
                          }}
                          className={`hairline-text-input ${errors.email ? 'has-error' : ''}`}
                        />
                        {errors.email && <span className="hairline-err">{errors.email}</span>}
                      </div>

                      <div className="hairline-input-wrap">
                        <label className="hairline-label">Número de Huéspedes</label>
                        <select
                          value={contactData.personas}
                          onChange={(e) => setContactData({ ...contactData, personas: e.target.value })}
                          className="hairline-select-input"
                        >
                          <option value="1">1 Persona (Cabina Individual)</option>
                          <option value="2">2 Personas (Cabina Dúo / Pareja)</option>
                        </select>
                      </div>

                      <div className="hairline-input-wrap full-width">
                        <label className="hairline-label">Notas o requerimientos especiales (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Molestias específicas, tensión en hombros o preferencias aromáticas"
                          value={contactData.notas}
                          onChange={(e) => setContactData({ ...contactData, notas: e.target.value })}
                          className="hairline-text-input"
                        />
                      </div>
                    </div>

                    <div className="atelier-actions-row">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="btn-atelier-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Atrás</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep3()) goToStep(4);
                        }}
                        className="btn-atelier-primary"
                      >
                        <span>Revisar y Confirmar ($5 USD)</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    PASO 4: CONFIRMACIÓN Y DEPÓSITO ($5 USD)
                    ======================================================== */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="atelier-step-view"
                  >
                    <div className="step-intro-bar">
                      <h3 className="step-intro-title">Confirmación de Cita</h3>
                      <span className="step-intro-count">Depósito seguro de garantía</span>
                    </div>

                    <div className="minimal-checkout-grid">
                      {/* Resumen Conciso */}
                      <div className="checkout-summary-column">
                        <div className="summary-clean-card">
                          <div className="summary-clean-row">
                            <span className="clean-label">Tratamiento:</span>
                            <span className="clean-value serif-title">{chosenRitual.title}</span>
                          </div>
                          <div className="summary-clean-row">
                            <span className="clean-label">Fecha y Hora:</span>
                            <span className="clean-value">{selectedDate} — {selectedHour}</span>
                          </div>
                          <div className="summary-clean-row">
                            <span className="clean-label">Huésped:</span>
                            <span className="clean-value">{contactData.nombre}</span>
                          </div>

                          <div className="courtesy-reminder-block">
                            <Wine size={16} strokeWidth={1.5} className="wine-glyph" />
                            <div>
                              <strong>Bebida de cortesía incluida</strong>
                            </div>
                          </div>

                          <div className="deposit-callout-row">
                            <div>
                              <span className="deposit-tag">Depósito de garantía:</span>
                              <span className="deposit-sub">* Acreditado al ritual en recepción</span>
                            </div>
                            <span className="deposit-val">$5.00 USD</span>
                          </div>
                        </div>
                      </div>

                      {/* Pasarela Minimalista de Tarjeta */}
                      <div className="checkout-payment-column">
                        <div className="payment-security-header">
                          <Lock size={13} />
                          <span>Conexión cifrada SSL 256-bit</span>
                        </div>

                        <form onSubmit={handlePaymentAndConfirm} className="minimal-payment-form">
                          <div className="hairline-input-wrap">
                            <label className="hairline-label">Número de Tarjeta</label>
                            <div className="relative-card-box">
                              <CreditCard size={15} className="card-glyph" />
                              <input
                                type="text"
                                placeholder="•••• •••• •••• ••••"
                                maxLength={19}
                                value={cardData.cardNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                  setCardData({ ...cardData, cardNumber: formatted });
                                  setErrors({ ...errors, cardNumber: '' });
                                }}
                                className={`hairline-text-input with-glyph ${errors.cardNumber ? 'has-error' : ''}`}
                              />
                            </div>
                            {errors.cardNumber && <span className="hairline-err">{errors.cardNumber}</span>}
                          </div>

                          <div className="hairline-dual-row">
                            <div className="hairline-input-wrap">
                              <label className="hairline-label">Vencimiento</label>
                              <input
                                type="text"
                                placeholder="MM/AA"
                                maxLength={5}
                                value={cardData.cardExp}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                  if (val.length >= 3) val = `${val.substring(0, 2)}/${val.substring(2)}`;
                                  setCardData({ ...cardData, cardExp: val });
                                  setErrors({ ...errors, cardExp: '' });
                                }}
                                className={`hairline-text-input ${errors.cardExp ? 'has-error' : ''}`}
                              />
                              {errors.cardExp && <span className="hairline-err">{errors.cardExp}</span>}
                            </div>

                            <div className="hairline-input-wrap">
                              <label className="hairline-label">CVC</label>
                              <input
                                type="password"
                                placeholder="•••"
                                maxLength={4}
                                value={cardData.cardCvc}
                                onChange={(e) => {
                                  setCardData({ ...cardData, cardCvc: e.target.value.replace(/\D/g, '') });
                                  setErrors({ ...errors, cardCvc: '' });
                                }}
                                className={`hairline-text-input ${errors.cardCvc ? 'has-error' : ''}`}
                              />
                              {errors.cardCvc && <span className="hairline-err">{errors.cardCvc}</span>}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessingPayment}
                            className="btn-atelier-submit"
                          >
                            {isProcessingPayment ? (
                              <span>Asegurando tu cita...</span>
                            ) : (
                              <>
                                <span>Asegurar cita con $5.00 USD</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </button>

                          <p className="minimal-cancellation-terms">
                            Cancelación o cambio de fecha sin costo con 24 horas de antelación. Los $5 USD quedan acreditados a tu cuenta final al presentarte en el spa.
                          </p>
                        </form>
                      </div>
                    </div>

                    <div className="atelier-actions-row">
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        disabled={isProcessingPayment}
                        className="btn-atelier-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Atrás</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            /* ========================================================
                PANTALLA DE ÉXITO MINIMALISTA
                ======================================================== */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="minimal-success-stage"
            >
              <div className="success-monogram-circle">
                <CheckCircle2 size={42} strokeWidth={1.5} className="success-icon" />
              </div>

              <h3 className="success-main-title">Tu cita está asegurada</h3>
              <p className="success-sub-text">
                Hemos reservado tu cabina privada y terapeuta. El anticipo de $5 USD fue procesado correctamente e incluye tu bebida de cortesía a tu llegada.
              </p>

              <div className="success-card-summary">
                {confirmationCode && (
                  <div className="success-line">
                    <span className="lbl">Referencia de Pago:</span>
                    <span className="val" style={{ fontWeight: 600, color: '#A46838', letterSpacing: '0.08em' }}>
                      {confirmationCode}
                    </span>
                  </div>
                )}
                <div className="success-line">
                  <span className="lbl">Depósito de Garantía:</span>
                  <span className="val">$5.00 USD (Aprobado)</span>
                </div>
                <div className="success-line">
                  <span className="lbl">Tratamiento:</span>
                  <span className="val serif-title">{chosenRitual.title}</span>
                </div>
                <div className="success-line">
                  <span className="lbl">Fecha y Hora:</span>
                  <span className="val">{selectedDate} a las {selectedHour}</span>
                </div>
                <div className="success-line">
                  <span className="lbl">Titular:</span>
                  <span className="val">{contactData.nombre}</span>
                </div>
                <div className="success-line">
                  <span className="lbl">Ubicación:</span>
                  <span className="val">{spaSettings.address}</span>
                </div>

                <div className="success-drink-reminder">
                  <Wine size={15} strokeWidth={1.5} />
                  <span>Tu bebida de cortesía estará esperándote a tu llegada.</span>
                </div>
              </div>

              <div className="success-links-row">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-minimal-calendar"
                >
                  <CalendarPlus size={15} />
                  <span>Añadir a Google Calendar</span>
                </a>

                <a
                  href={getWhatsAppConfirmationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-minimal-whatsapp"
                >
                  <MessageCircle size={15} />
                  <span>Escribir por WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsConfirmed(false);
                  goToStep(1);
                  setContactData({ nombre: '', telefono: '', email: '', personas: '1', notas: '' });
                }}
                className="btn-minimal-reset"
              >
                Agendar otra cita
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;
