import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { images } from '../../data/images';
import './Hero.css';

const SLIDE_DURATION = 6000;

const heroSlides = [
  {
    id: 'manos2',
    src: '/assets/manos2.jpg',
    srcSet: '/assets/optimized/hero-manos2-768w.webp 768w, /assets/optimized/hero-manos2-1200w.webp 1200w, /assets/optimized/hero-manos2.webp 1920w, /assets/manos2.jpg 1920w',
    alt: 'Terapia manual y masaje relajante en Venus Elegant Spa',
    focalPoint: 'center 45%',
    name: 'Terapia Manual y Masaje Holístico',
    num: '01',
  },
  {
    id: 'manos1',
    src: '/assets/manos1.jpg',
    srcSet: '/assets/optimized/hero-manos1-768w.webp 768w, /assets/optimized/hero-manos1-1200w.webp 1200w, /assets/optimized/hero-manos1.webp 1920w, /assets/manos1.jpg 1920w',
    alt: 'Cuidado y relajación con técnicas manuales especializadas',
    focalPoint: 'center 45%',
    name: 'Terapia Relajante de Manos y Cuidado Profundo',
    num: '02',
  },
  {
    id: 'manos3',
    src: '/assets/manos3.jpg',
    srcSet: '/assets/optimized/hero-manos3-768w.webp 768w, /assets/optimized/hero-manos3-1200w.webp 1200w, /assets/optimized/hero-manos3.webp 1920w, /assets/manos3.jpg 1920w',
    alt: 'Masaje terapéutico y bienestar corporal en cabina privada',
    focalPoint: 'center 45%',
    name: 'Masaje Terapéutico y Bienestar Corporal',
    num: '03',
  },
  {
    id: 'manos4',
    src: '/assets/manos4.jpg',
    srcSet: '/assets/optimized/hero-manos4-768w.webp 768w, /assets/optimized/hero-manos4-1200w.webp 1200w, /assets/optimized/hero-manos4.webp 1920w, /assets/manos4.jpg 1920w',
    alt: 'Técnica de masaje y armonización sensorial',
    focalPoint: 'center 45%',
    name: 'Técnica Especializada y Armonía',
    num: '04',
  },
  {
    id: 'playa1',
    src: '/assets/playa1.jpg',
    srcSet: '/assets/optimized/hero-playa1-768w.webp 768w, /assets/optimized/hero-playa1-1200w.webp 1200w, /assets/optimized/hero-playa1.webp 1920w, /assets/playa1.jpg 1920w',
    alt: 'Horizonte costero al atardecer y calma marina',
    focalPoint: 'center 50%',
    name: 'Horizonte Dorado — Calma Marina',
    num: '05',
  },
  {
    id: 'pies1',
    src: '/assets/pies1.jpg',
    srcSet: '/assets/optimized/hero-pies1-768w.webp 768w, /assets/optimized/hero-pies1-1200w.webp 1200w, /assets/optimized/hero-pies1.webp 1920w, /assets/pies1.jpg 1920w',
    alt: 'Reflexología podal y cuidado relajante de pies en Venus Elegant Spa',
    focalPoint: 'center 45%',
    name: 'Reflexología Podal y Renovación',
    num: '06',
  },
  {
    id: 'vela1',
    src: '/assets/vela1.jpg',
    srcSet: '/assets/optimized/hero-vela1-768w.webp 768w, /assets/optimized/hero-vela1-1200w.webp 1200w, /assets/optimized/hero-vela1.webp 1920w, /assets/vela1.png 1920w',
    alt: 'Vela aromática y ambiente íntimo de relajación en Venus Spa',
    focalPoint: 'center 45%',
    name: 'Atmósfera Cálida y Armonía',
    num: '07',
  },
  {
    id: 'relax',
    src: '/assets/relax.jpg',
    srcSet: '/assets/optimized/hero-relax-768w.webp 768w, /assets/optimized/hero-relax-1200w.webp 1200w, /assets/optimized/hero-relax.webp 1920w, /assets/relax.jpg 1920w',
    alt: 'Sesión de relajación y desconexión en el spa',
    focalPoint: 'center 45%',
    name: 'Descanso Profundo y Serenidad',
    num: '08',
  },
  {
    id: 'masaje5',
    src: '/assets/masaje5.jpg',
    srcSet: '/assets/optimized/hero-masaje5-768w.webp 768w, /assets/optimized/hero-masaje5-1200w.webp 1200w, /assets/optimized/hero-masaje5.webp 1920w, /assets/masaje5.jpg 1920w',
    alt: 'Masaje corporal terapéutico con aceites naturales',
    focalPoint: 'center 45%',
    name: 'Terapia Corporal Especializada',
    num: '09',
  },
];

const Hero = ({ spaSettings }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const slideTimerRef = useRef(null);
  const heroRef = useRef(null);

  // Auto-cycle with smooth crossfade
  useEffect(() => {
    slideTimerRef.current = setTimeout(() => {
      setPrevSlide(currentSlide);
      setCurrentSlide((p) => (p + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(slideTimerRef.current);
  }, [currentSlide]);

  const goToSlide = (idx) => {
    if (idx === currentSlide) return;
    clearTimeout(slideTimerRef.current);
    setPrevSlide(currentSlide);
    setCurrentSlide(idx);
  };

  // Card-scale on scroll (image shrinks slightly, NOT the content)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imgScale   = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const imgRadius  = useTransform(scrollYProgress, [0, 0.8], ['0px', '18px']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const active = heroSlides[currentSlide];

  return (
    <section
      id="inicio"
      data-theme="dark"
      ref={heroRef}
      className="hero-stage"
    >
      {/* ── Background slideshow (absolute, full inset) ── */}
      <motion.div
        className="hero-bg-card"
        style={{ scale: imgScale, borderRadius: imgRadius }}
      >
        <div className="hero-slides">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const isLeaving = idx === prevSlide;
            return (
              <div
                key={slide.id}
                className={`hero-slide ${isActive ? 'is-active' : ''} ${isLeaving ? 'is-leaving' : ''}`}
                aria-hidden={!isActive}
              >
                <img
                  src={slide.src}
                  srcSet={slide.srcSet}
                  sizes="100vw"
                  alt={slide.alt}
                  className="hero-slide-img"
                  style={{ objectPosition: slide.focalPoint }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                />
              </div>
            );
          })}
        </div>

        {/* Overlays — lighter top, deeper bottom only */}
        <div className="hero-scrim-top"    aria-hidden="true" />
        <div className="hero-scrim-bottom" aria-hidden="true" />
        <div className="hero-tint"         aria-hidden="true" />
        <div className="hero-grain"        aria-hidden="true" />
      </motion.div>

      {/* ── Corner marks (decoration, low z) ── */}
      <div className="hero-corners" aria-hidden="true">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
      </div>

      {/* ── 3-row grid content ── */}
      <motion.div className="hero-grid" style={{ opacity: contentOpacity }}>

        {/* Row 1: spacer = navbar height (CSS var) */}
        <div className="hero-row-nav-spacer" />

        {/* Row 2: Title — normal flow, align-end */}
        <div className="hero-row-title">
          <div className="hero-title-block">
            {/* Kicker */}
            <motion.p
              className="hero-kicker"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Santuario de Bienestar y Quietud
            </motion.p>

            {/* H1 */}
            <h1 className="hero-headline">
              {/* Line 1: "Calma que" */}
              <span className="hero-mask">
                <motion.span
                  className="hero-word"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  Calma que
                </motion.span>
              </span>
              {/* Line 2: "se siente" */}
              <span className="hero-mask">
                <motion.span
                  className="hero-word hero-accent"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.1, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  se siente
                </motion.span>
              </span>
            </h1>
          </div>
        </div>

        {/* Row 3: Bottom bar — 3 columns */}
        <div className="hero-row-bottom">
          {/* Left: phrase + CTAs */}
          <div className="hero-bottom-left">
            <motion.p
              className="hero-subphrase"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              Un santuario privado concebido para devolverte a tu centro y serenidad natural.
            </motion.p>
            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="#reservas" className="hero-cta-primary">
                <span>Reservar cita</span>
                <ArrowUpRight size={13} />
                <span className="cta-line" aria-hidden="true" />
              </a>
              <a href="#servicios" className="hero-cta-ghost">Ver tratamientos</a>
            </motion.div>
          </div>

          {/* Right: counter + progress */}
          <div className="hero-bottom-right">
            <div className="hero-slide-info">
              <span className="slide-fraction">{active.num} / {String(heroSlides.length).padStart(2, '0')}</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={active.id}
                  className="slide-name"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.4 }}
                >
                  {active.name}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="hero-progress">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`progress-seg ${i === currentSlide ? 'is-on' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Imagen ${s.num}: ${s.name}`}
                >
                  <span className="seg-track">
                    <span
                      className="seg-fill"
                      style={{
                        animationDuration: `${SLIDE_DURATION}ms`,
                        animationPlayState: i === currentSlide ? 'running' : 'paused',
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export default Hero;
