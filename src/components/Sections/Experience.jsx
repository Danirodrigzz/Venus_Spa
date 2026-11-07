import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import experienceData from '../../data/experienceData';
import './Experience.css';

// Canvas de partículas de luz cálida suspendidas (como vapor o polvo de luz)
const SanctuaryParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = false;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Observar visibilidad para pausar animación cuando el usuario no esté en esta sección
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting || false;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas.parentElement);

    const particles = Array.from({ length: 14 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.6,
      opacity: Math.random() * 0.25 + 0.1,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: -Math.random() * 0.2 - 0.05,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.06;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 175, 120, ${Math.max(0.04, currentOpacity)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="sanctuary-particles-canvas" aria-hidden="true" />;
};

const Experience = () => {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartY = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isMobile) return;
    let current = 0;
    if (latest >= 0.72) current = 3;
    else if (latest >= 0.46) current = 2;
    else if (latest >= 0.20) current = 1;

    if (current !== activeStep) {
      setActiveStep(current);
    }
  });

  const goToStep = useCallback(
    (index) => {
      const targetIdx = Math.max(0, Math.min(experienceData.length - 1, index));
      setActiveStep(targetIdx);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerTop = rect.top + scrollTop;
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      const stepOffsets = [0.02, 0.32, 0.62, 0.95];
      const targetScroll = containerTop + stepOffsets[targetIdx] * totalScrollable;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    },
    []
  );

  // Navegación con teclado (Flechas Arriba/Abajo/Izquierda/Derecha)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Solo actuar si la sección está en el viewport
      if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          goToStep(activeStep + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          goToStep(activeStep - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, goToStep]);

  // Soporte táctil / swipe
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeStep < experienceData.length - 1) {
        goToStep(activeStep + 1);
      } else if (diff < 0 && activeStep > 0) {
        goToStep(activeStep - 1);
      }
    }
    touchStartY.current = null;
  };

  const currentAct = experienceData[activeStep] || experienceData[0];

  return (
    <section
      id="experiencia"
      data-theme="dark"
      ref={containerRef}
      className={`experience-pinned-section ${isMobile ? 'is-mobile' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========================================================
          DESKTOP: Fotografía a Sangre Completa + Texto en Esquina
          ======================================================== */}
      {!isMobile ? (
        <div className="ritual-fullbleed-viewport">
          {/* LIENZO FOTOGRÁFICO A SANGRE COMPLETA (100% ancho y alto) */}
          <div className="ritual-fullbleed-backdrop">
            {experienceData.map((act, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={act.step || idx}
                  className={`fullbleed-photo-layer ${isActive ? 'is-active' : ''}`}
                >
                  <img
                    src={act.image}
                    alt={act.title}
                    className="fullbleed-photo-asset"
                    style={{ objectPosition: act.focalPoint || 'center center' }}
                  />
                </div>
              );
            })}

            {/* Degradado oscuro suave solo detrás del texto en esquina inferior izquierda */}
            <div className="ritual-scrim-bottom-left" />

            {/* Viñeta sutil en los bordes para unificar fotografía */}
            <div className="ritual-scrim-vignette" />

            {/* Partículas de luz cálida suspendidas */}
            <SanctuaryParticles />
          </div>

          {/* Marca de agua casi imperceptible con el nombre de la etapa */}
          <div className="ritual-watermark-phase" aria-hidden="true">
            {currentAct.phase}
          </div>

          {/* ========================================================
              Texto en Esquina Inferior Izquierda (Limpio y Esencial)
              ======================================================== */}
          <div className="ritual-bottom-left-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAct.step}
                className="ritual-clean-text-stack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 1. Nombre de la etapa en mayúsculas sutiles */}
                <motion.div
                  className="ritual-kicker-clean"
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                >
                  <span className="kicker-rule" />
                  <span className="kicker-phase-text">{currentAct.phase.toUpperCase()}</span>
                </motion.div>

                {/* 2. Título principal en serif elegante */}
                <motion.h3
                  className="ritual-hero-title"
                  initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.12 }}
                >
                  {currentAct.title}
                </motion.h3>

                {/* 3. Subtítulo en cursiva cálida */}
                <motion.p
                  className="ritual-hero-sub"
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.65, delay: 0.18 }}
                >
                  {currentAct.italicSubtitle}
                </motion.p>

                {/* 4. Una o dos líneas de descripción */}
                <motion.p
                  className="ritual-hero-desc"
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.65, delay: 0.24 }}
                >
                  {currentAct.description}
                </motion.p>

                {/* 5. Cita protagonista */}
                <motion.blockquote
                  className="ritual-hero-quote"
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.75, delay: 0.36 }}
                >
                  <p className="quote-text-clean">
                    {currentAct.quote}
                  </p>
                </motion.blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ========================================================
              Navegación Vertical Discreta en el Borde Derecho
              - 4 marcas finas (pequeños trazos)
              - Solo el nombre de la etapa activa visible en cursiva + contador '02 / 04'
              - El trazo activo se alarga y se ilumina en ámbar
              - Las otras etapas muestran su nombre solo en hover
              ======================================================== */}
          <nav className="ritual-vertical-edge-nav" aria-label="Navegación del Ritual">
            <div className="vertical-edge-track">
              {experienceData.map((act, idx) => {
                const isActive = activeStep === idx;
                const isHovered = hoveredStep === idx;
                return (
                  <button
                    key={act.step || idx}
                    type="button"
                    onClick={() => goToStep(idx)}
                    onMouseEnter={() => setHoveredStep(idx)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={`vertical-stage-tick-btn ${isActive ? 'is-active' : ''}`}
                    aria-label={`Ir a: ${act.phase}`}
                  >
                    {/* Trazo fino horizontal que se alarga y se ilumina en ámbar */}
                    <span className="stage-tick-line" />

                    {/* Nombre y contador: siempre para la activa, en hover para las demás */}
                    <AnimatePresence>
                      {(isActive || isHovered) && (
                        <motion.div
                          className="stage-tick-info"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <span className="tick-phase-name"><em>{act.phase}</em></span>
                          {isActive && (
                            <span className="tick-phase-counter">
                              0{idx + 1} / 04
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      ) : (
        /* ========================================================
            MÓVIL: Pantalla Completa con Foto + Texto Inferior
            ======================================================== */
        <div className="ritual-mobile-immersive">
          <header className="mobile-immersive-header">
            <div className="counter-current">0{activeStep + 1} / 04</div>
            <span className="counter-dot">·</span>
            <span className="counter-tag">{currentAct.phase.toUpperCase()}</span>
          </header>

          <div className="mobile-snap-stages">
            {experienceData.map((act, idx) => (
              <article key={act.step || idx} className="mobile-stage-item">
                <div className="mobile-stage-photo-backdrop">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="mobile-stage-img"
                    style={{ objectPosition: act.focalPoint || 'center center' }}
                  />
                  <div className="mobile-stage-scrim" />
                </div>

                <div className="mobile-stage-content">
                  <div className="ritual-kicker-clean">
                    <span className="kicker-rule" />
                    <span className="kicker-phase-text">{act.phase.toUpperCase()}</span>
                  </div>

                  <h3 className="mobile-stage-title">{act.title}</h3>
                  <p className="mobile-stage-sub">{act.italicSubtitle}</p>
                  <p className="mobile-stage-desc">{act.description}</p>

                  <blockquote className="mobile-quote-wrap">
                    <p className="mobile-quote-body">{act.quote}</p>
                  </blockquote>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Experience;
