import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionTitle from '../UI/SectionTitle';
import TreatedImage from '../UI/TreatedImage';
import './About.css';

const manifestoWords = [
  "El", "descanso", "no", "es", "una", "pausa",
  "pasiva,", "sino", "el", "mayor", "acto", "de",
  "cuidado", "hacia", "tu", "propia", "energía,",
  "bienestar", "y", "serenidad."
];

const About = () => {
  const sectionRef = useRef(null);
  const manifestoRef = useRef(null);
  const imageRef = useRef(null);

  // Parallax on the image (moves slower than scroll)
  const { scrollYProgress: imgScroll } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(imgScroll, [0, 1], ['-3%', '3%']);

  // Scroll-reveal manifesto
  const { scrollYProgress: textScroll } = useScroll({
    target: manifestoRef,
    offset: ['start 90%', 'end 40%'],
  });

  return (
    <section id="nosotros" data-theme="light" ref={sectionRef} className="about-cinematic">
      {/* Full-bleed editorial grid */}
      <div className="about-cinematic-grid">

        {/* LEFT — Parallax image column, bleeds to edge */}
        <div className="about-image-column">
          <div className="about-image-overflow-clip">
            <motion.div
              ref={imageRef}
              className="about-parallax-image-wrap"
              style={{ y: imageY }}
            >
              <TreatedImage
                imageKey="aboutStillLife"
                focalPoint="center 50%"
                className="about-parallax-img"
                imgClassName="about-parallax-asset"
              />
            </motion.div>
          </div>

          {/* Floating caption pinned over bottom of image */}
          <div className="about-image-caption-float">
            <span className="about-img-tag">Santuario de Calma</span>
            <span className="about-img-divider">—</span>
            <span className="about-img-desc">Espacio de Bienestar y Desconexión Total</span>
          </div>
        </div>

        {/* RIGHT — Editorial narrative */}
        <div className="about-narrative-column">
          <div className="about-narrative-inner">
            <SectionTitle
              tag="EL SANTUARIO"
              title="Un templo privado donde el"
              italicTitle="tiempo se detiene"
              align="left"
              className="about-section-header"
            />

            <p className="about-lead-text">
              Ubicado en el tercer nivel de Plaza Rubi en la Avenida España,
              Venus Elegant Spa fue concebido como un remanso de discreción y quietud
              en medio de la energía vibrante de Santo Domingo Este.
            </p>
            <p className="about-body-text">
              Cada cabina individual está acondicionada acústicamente y dotada de
              luz tenue, toallas botánicas calientes y aromaterapia de lavanda y eucalipto.
              Nuestro equipo de terapeutas certificadas adapta la intensidad, el ritmo y los
              aceites esenciales a las necesidades precisas de tu cuerpo.
            </p>

            {/* Scroll-illuminated manifesto */}
            <div ref={manifestoRef} className="about-manifesto-block">
              <div className="manifesto-accent-line" aria-hidden="true" />
              <blockquote className="about-illuminated-quote">
                {manifestoWords.map((word, i) => {
                  const start = i / manifestoWords.length;
                  const end = Math.min(start + 2 / manifestoWords.length, 1);
                  const opacity = useTransform(textScroll, [start, end], [0.18, 1]);
                  return (
                    <motion.span key={i} style={{ opacity }} className="manifesto-word">
                      {word}{' '}
                    </motion.span>
                  );
                })}
              </blockquote>
            </div>

            {/* Stats row */}
            <div className="about-stats-row">
              {[
                { num: '100%', label: 'Cabinas Privadas' },
                { num: '09',   label: 'Rituales Exclusivos' },
                { num: '10+',  label: 'Años de Maestría' },
              ].map((stat, i) => (
                <React.Fragment key={stat.num}>
                  {i > 0 && <div className="stats-divider" aria-hidden="true" />}
                  <motion.div
                    className="stat-item"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="stat-number">{stat.num}</span>
                    <span className="stat-label">{stat.label}</span>
                  </motion.div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
