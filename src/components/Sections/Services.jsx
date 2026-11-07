import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useSpaServices } from '../../hooks/useSpaServices';
import servicesData from '../../data/servicesData';
import SectionTitle from '../UI/SectionTitle';
import './Services.css';

/*
  Venus Elegant Spa — Carta de Rituales (Edición Ultra-Lujo)
  - Cero etiquetas: cada fila muestra estrictamente número, nombre, duración, precio y flecha.
  - Columna fotográfica fija a sangre (100vh) a la derecha, sin marco, sin cortes y sin huecos.
  - La foto permanece fija durante todo el recorrido de la lista y se desvanece suavemente al final de la sección.
  - Precarga de imágenes para transiciones instantáneas sin parpadeo.
  - Reserva integrada con el nuevo módulo de $5 USD y bebida de cortesía.
*/

const Services = () => {
  const { services } = useSpaServices();
  const [hoveredService, setHoveredService] = useState(null);
  const [expandedId, setExpandedId] = useState(1); // Primer ritual abierto por defecto
  const [activePhotoService, setActivePhotoService] = useState(() => servicesData[0]);

  // Precarga inmediata de todas las imágenes de los rituales
  useEffect(() => {
    if (services && services.length > 0) {
      services.forEach((s) => {
        if (s.image) {
          const img = new Image();
          img.src = s.image;
        }
      });
      if (!activePhotoService) {
        setActivePhotoService(services[0]);
      }
    }
  }, [services, activePhotoService]);

  const handleReserveRitual = (serviceTitle) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('selectServiceForBooking', { detail: { serviceTitle } })
      );
      const bookingEl = document.getElementById('reservas');
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = '#reservas';
      }
    }
  };

  // Mantener siempre una foto activa (hovered, luego expanded, o última vista, nunca vacía)
  useEffect(() => {
    if (hoveredService) {
      setActivePhotoService(hoveredService);
    } else if (expandedId) {
      const found = services.find((s) => s.id === expandedId);
      if (found) setActivePhotoService(found);
    }
  }, [hoveredService, expandedId, services]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="servicios" data-theme="dark" className="services-master-section">
      {/* Fondo con profundidad y luz cálida difusa */}
      <div className="services-ambient-glow" aria-hidden="true" />

      <div className="services-master-container">
        {/* Cabecera Sobria y Equilibrada */}
        <div className="services-master-header">
          <SectionTitle
            tag="CARTA DE RITUALES"
            title="Tratamientos corporales y"
            italicTitle="terapias sensoriales"
            description="Una selección de diez rituales concebidos bajo principios de serenidad, tacto maestro y botánica noble."
            align="center"
            light={true}
          />
        </div>

        {/* ========================================================
            ESTRUCTURA PRINCIPAL: LISTA EDITORIAL + FOTO FIJA 100VH
            ======================================================== */}
        <div className="services-master-stage-split">
          {/* Columna Izquierda: Lista Continua (01 a 10) */}
          <div className="services-master-list-col">
            {/* Marca de agua casi imperceptible con la palabra 'Rituales' */}
            <div className="services-watermark-bg" aria-hidden="true">
              Rituales
            </div>

            <div className="services-master-list" role="list">
              {services.map((service, index) => {
                const isExpanded = expandedId === service.id;
                const isHovered = hoveredService?.id === service.id;
                const itemNum = index < 9 ? `0${index + 1}` : `${index + 1}`;
                const isDimmed = hoveredService ? !isHovered : (expandedId !== null && !isExpanded);

                const waMessage = encodeURIComponent(
                  `Hola, me gustaría reservar el ritual "${service.title}" en Venus Elegant Spa.`
                );
                const waUrl = `https://wa.me/18493164217?text=${waMessage}`;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.55, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
                    className={`master-item-row ${isExpanded ? 'is-expanded' : ''} ${
                      isDimmed ? 'is-dimmed' : 'is-focused'
                    }`}
                    onMouseEnter={() => {
                      setHoveredService(service);
                      setActivePhotoService(service);
                    }}
                    onMouseLeave={() => setHoveredService(null)}
                  >
                    {/* Fila Principal del Ritual (Cero etiquetas, sólo número, nombre, duración y precio) */}
                    <div
                      className="master-row-summary"
                      onClick={() => {
                        toggleExpand(service.id);
                        setActivePhotoService(service);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`Detalles de ${service.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(service.id);
                          setActivePhotoService(service);
                        }
                      }}
                    >
                      {/* Número pequeño y tenue en cobre */}
                      <span className="master-item-num">{itemNum}</span>

                      {/* Título en serif grande sin etiquetas */}
                      <h3 className="master-item-title">{service.title}</h3>

                      {/* Columnas fijas de Acción y Flecha Fina */}
                      <div className="master-item-meta-columns">
                        {service.show_price && service.price && (
                          <span className="master-col-price">
                            RD$ {service.price}
                          </span>
                        )}
                        <span className={`master-col-arrow ${isExpanded ? 'is-active' : ''}`} aria-hidden="true">
                          <ArrowRight size={14} className="arrow-svg" />
                        </span>
                      </div>
                    </div>

                    {/* Contenido Expandido del Ritual */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="master-row-expanded-wrap"
                        >
                          <div className="master-expanded-content">
                            {/* Preview fotográfico visible sólo en móvil */}
                            <div className="master-mobile-photo-box">
                              <img
                                src={service.image}
                                alt={service.title}
                                className="master-mobile-photo"
                                style={{ objectPosition: service.focalPoint }}
                              />
                              <div className="master-mobile-scrim" />
                            </div>

                            <p className="master-expanded-desc">{service.description}</p>

                            {/* Beneficios en una sola línea separada por puntos */}
                            {service.highlights && service.highlights.length > 0 && (
                              <div className="master-expanded-benefits">
                                {service.highlights.join('  ·  ')}
                              </div>
                            )}

                            {/* Botón Discreto de Reserva: Preselecciona ritual y salta a Reservas */}
                            <div className="master-expanded-actions">
                              <a
                                href="#reservas"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleReserveRitual(service.title);
                                }}
                                className="master-reserve-btn"
                                aria-label={`Reservar ${service.title}`}
                              >
                                <span>Reservar este ritual</span>
                                <ArrowUpRight size={13} className="btn-arrow" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Línea divisoria finísima con degradado cobre que se desvanece en extremos */}
                    <div className="master-row-separator" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Escenario Fotográfico Fijo a Sangre (100vh completo, sin marcos ni huecos) */}
          <div className="services-master-photo-col" aria-hidden="true">
            <div className="master-sticky-photo-stage">
              <AnimatePresence mode="wait">
                {activePhotoService && (
                  <motion.div
                    key={activePhotoService.id}
                    className="master-photo-layer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <img
                      src={activePhotoService.image}
                      alt={activePhotoService.title}
                      className="master-fullbleed-img"
                      style={{ objectPosition: activePhotoService.focalPoint || 'center 40%' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Degradado lateral izquierdo largo y suave que funde la foto con el fondo */}
              <div className="master-photo-fade-scrim" />

              {/* Viñeta sutil en bordes superior e inferior */}
              <div className="master-photo-vertical-scrim" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
