import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import testimonialsData from '../../data/testimonialsData';
import { images } from '../../data/images';
import SectionTitle from '../UI/SectionTitle';
import './Testimonials.css';

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent((prevIdx) => (prevIdx === 0 ? testimonialsData.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrent((prevIdx) => (prevIdx === testimonialsData.length - 1 ? 0 : prevIdx + 1));
  };

  const active = testimonialsData[current];
  const bgImg = images.testimonialsBackdrop?.src || '/assets/optimized/hero-twilight-tide.webp';

  return (
    <section id="testimonios" data-theme="light" className="testimonials-editorial-luminous">
      <div className="container container-narrow testimonials-inner-container">
        <SectionTitle
          tag="RESEÑAS Y OPINIONES"
          title="Voces de quienes habitan"
          italicTitle="la quietud"
          align="left"
        />

        <div className="testimonial-single-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="testimonial-editorial-block"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Comilla Gigante Escénica */}
              <div className="testimonial-giant-mark" aria-hidden="true">“</div>

              <blockquote className="testimonial-monumental-quote">
                {active.quote}
              </blockquote>

              <div className="testimonial-author-line">
                <span className="author-name-text">{active.author}</span>
                <span className="author-separator">—</span>
                <span className="author-detail-text">{active.role}, {active.service}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimal Controls */}
          <div className="testimonial-bottom-nav">
            <div className="nav-fraction">
              <span className="fraction-current">0{current + 1}</span>
              <span className="slash">/</span>
              <span className="fraction-total">0{testimonialsData.length}</span>
            </div>

            <div className="nav-arrow-group">
              <button
                onClick={prev}
                className="nav-hairline-btn"
                aria-label="Opinión anterior"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={next}
                className="nav-hairline-btn"
                aria-label="Siguiente opinión"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
