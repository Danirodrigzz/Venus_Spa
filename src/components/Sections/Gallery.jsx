import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import './Gallery.css';

/*
  Venus Elegant Spa — Galería Interactiva de Espacios (Mosaico Asimétrico Editorial)
  - Recorrido horizontal interactivo (drag + wheel) con inercia y composición asimétrica
  - Títulos de estancia entre grupos (Recepción, Cabinas, Transición, Lounge)
  - Fotos de distintos formatos y alturas desfasadas (revista editorial)
  - Cursor personalizado cobre que indica "Ver" sobre las fotos
  - Expansión inmersiva a pantalla completa al hacer clic
  - Tratamiento cálido de color unificado (ámbar, miel, luz de velas)
*/

const gallerySpaces = [
  {
    id: 1,
    zone: 'SUITE DE MASAJES',
    title: 'Cabina Principal de Armonización',
    description: 'Camilla ergonómica calefactada, mármol noble y luz circadiana tenue concebida para la desconexión total.',
    src: '/assets/portada.png',
    focalPoint: 'center 46%',
    size: 'large-landscape', // 480x340
    offsetY: 0,
  },
  {
    id: 2,
    zone: 'CABINAS PRIVADAS',
    title: 'Santuario Sensorial',
    description: 'Insonorización acústica, termoterapia con toallas tibias y aceites botánicos templados.',
    src: '/assets/optimized/hero-spa-cabina.webp',
    focalPoint: 'center 45%',
    size: 'tall-portrait', // 340x480
    offsetY: -25,
  },
  {
    id: 3,
    zone: 'TRANSICIÓN',
    title: 'Pasillo de Quietud Acústica',
    description: 'Iluminación rasante y diseño arquitectónico concebido para desacelerar el ritmo sensorial.',
    src: '/assets/pasillo_v2.png',
    focalPoint: 'center 45%',
    size: 'medium-portrait', // 320x420
    offsetY: 20,
  },
  {
    id: 4,
    zone: 'JARDÍN Y DESCANSO',
    title: 'Rincón de Calma Zen',
    description: 'Detalles botánicos, piedra natural y aromaterapia pura para una serenidad prolongada.',
    src: '/assets/spa3.jpeg',
    focalPoint: 'center 38%',
    size: 'large-landscape', // 460x340
    offsetY: -15,
  },
];

const Gallery = () => {
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isCursorActive, setIsCursorActive] = useState(false);
  const runwayRef = useRef(null);

  // Precargar imágenes para transiciones instantáneas
  useEffect(() => {
    gallerySpaces.forEach((space) => {
      const img = new Image();
      img.src = space.src;
    });
  }, []);

  // Soporte de rueda de ratón para desplazamiento horizontal en la galería
  const handleWheel = (e) => {
    if (!runwayRef.current) return;
    // Si el usuario hace scroll vertical sobre la galería, traducirlo a scroll horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      runwayRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  // Cursor personalizado sobre la galería
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Manejo de teclado para pantalla completa
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedSpaceIndex === null) return;
      if (e.key === 'Escape') setSelectedSpaceIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedSpaceIndex((prev) => (prev === gallerySpaces.length - 1 ? 0 : prev + 1));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedSpaceIndex((prev) => (prev === 0 ? gallerySpaces.length - 1 : prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSpaceIndex]);

  const activeModalSpace = selectedSpaceIndex !== null ? gallerySpaces[selectedSpaceIndex] : null;

  return (
    <section id="galeria" data-theme="dark" className="gallery-mosaic-section">
      {/* Encabezado Editorial con Presencia */}
      <div className="container gallery-mosaic-header">
        <span className="gallery-mosaic-kicker">ESPACIOS Y ARQUITECTURA</span>
        <h2 className="gallery-mosaic-title">
          Un recorrido visual por nuestras <em className="copper-italic">instalaciones privadas</em>
        </h2>
        <p className="gallery-mosaic-subtitle">
          Explora los rincones del santuario arrastrando o desplazándote a través de las estancias.
        </p>
      </div>

      {/* ========================================================
          RUNWAY HORIZONTAL ASIMÉTRICO (Mosaico Tipo Revista)
          ======================================================== */}
      <div
        className="gallery-runway-wrapper"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsCursorActive(true)}
        onMouseLeave={() => {
          setIsCursorActive(false);
          setHoveredId(null);
        }}
        onWheel={handleWheel}
      >
        {/* Cursor Personalizado Cobre Flotante */}
        {isCursorActive && (
          <motion.div
            className="gallery-copper-cursor"
            animate={{ x: cursorPos.x - 28, y: cursorPos.y - 28 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.2 }}
          >
            <span>Ver</span>
          </motion.div>
        )}

        <div className="gallery-runway-track" ref={runwayRef}>
          {gallerySpaces.map((space, idx) => {
            const isHovered = hoveredId === space.id;
            const isDimmed = hoveredId !== null && !isHovered;

            // Mostrar el separador de estancia cuando cambia de zona
            const prevSpace = idx > 0 ? gallerySpaces[idx - 1] : null;
            const isNewZone = !prevSpace || prevSpace.zone !== space.zone;

            return (
              <React.Fragment key={space.id}>
                {/* Separador de estancia arquitectónica */}
                {isNewZone && (
                  <div className="gallery-zone-divider">
                    <span className="zone-divider-label">{space.zone}</span>
                    <div className="zone-divider-line" />
                  </div>
                )}

                {/* Tarjeta de Foto Asimétrica */}
                <motion.div
                  className={`gallery-mosaic-card card-${space.size} ${isHovered ? 'is-hovered' : ''} ${
                    isDimmed ? 'is-dimmed' : ''
                  }`}
                  style={{ transform: `translateY(${space.offsetY}px)` }}
                  onMouseEnter={() => setHoveredId(space.id)}
                  onClick={() => setSelectedSpaceIndex(idx)}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="card-image-box">
                    <img
                      src={space.src}
                      alt={space.title}
                      className="card-photo-asset"
                      style={{ objectPosition: space.focalPoint }}
                    />
                    <div className="card-soft-scrim" />
                  </div>

                  {/* Información que aparece en hover */}
                  <div className="card-hover-caption">
                    <span className="card-caption-zone">{space.zone}</span>
                    <h4 className="card-caption-title">{space.title}</h4>
                    <p className="card-caption-desc">{space.description}</p>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Indicador de arrastre sutil */}
        <div className="gallery-drag-hint">
          <span>Arrastra o usa la rueda para recorrer</span>
          <span className="hint-arrow">→</span>
        </div>
      </div>

      {/* ========================================================
          VISTA INMERSIVA A PANTALLA COMPLETA (Modal de Detalle)
          ======================================================== */}
      <AnimatePresence>
        {activeModalSpace && (
          <motion.div
            className="gallery-inmersive-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setSelectedSpaceIndex(null)}
          >
            {/* Botón Discreto de Cierre */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedSpaceIndex(null)}
              aria-label="Cerrar vista inmersiva"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Flechas finas de navegación */}
            <button
              type="button"
              className="modal-arrow-btn arrow-prev"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSpaceIndex((prev) => (prev === 0 ? gallerySpaces.length - 1 : prev - 1));
              }}
              aria-label="Espacio anterior"
            >
              <ChevronLeft size={32} strokeWidth={1.2} />
            </button>

            <button
              type="button"
              className="modal-arrow-btn arrow-next"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSpaceIndex((prev) => (prev === gallerySpaces.length - 1 ? 0 : prev + 1));
              }}
              aria-label="Espacio siguiente"
            >
              <ChevronRight size={32} strokeWidth={1.2} />
            </button>

            {/* Fotografía Inmersiva */}
            <div className="modal-stage-container" onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={activeModalSpace.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="modal-photo-wrapper"
              >
                <img
                  src={activeModalSpace.src}
                  alt={activeModalSpace.title}
                  className="modal-photo-img"
                  style={{ objectPosition: activeModalSpace.focalPoint }}
                />
              </motion.div>

              {/* Información Editorial en la Base */}
              <div className="modal-caption-bar">
                <div className="modal-caption-text">
                  <span className="modal-zone-tag">{activeModalSpace.zone}</span>
                  <h3 className="modal-space-title">{activeModalSpace.title}</h3>
                  <p className="modal-space-desc">{activeModalSpace.description}</p>
                </div>

                <span className="modal-counter">
                  0{selectedSpaceIndex + 1} / 0{gallerySpaces.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
