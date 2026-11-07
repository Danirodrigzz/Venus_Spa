import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientAudio } from '../../hooks/useAmbientAudio';
import './Preloader.css';

const Preloader = ({ onLoaded }) => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { enterWithSound, enterSilent } = useAmbientAudio();

  useEffect(() => {
    // La línea fina de carga se completa en 700ms
    const timer = setTimeout(() => {
      setLoadingComplete(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterWithSound = (e) => {
    if (e) e.stopPropagation();
    enterWithSound();
    setDismissed(true);
    if (onLoaded) onLoaded();
  };

  const handleEnterSilent = (e) => {
    if (e) e.stopPropagation();
    enterSilent();
    setDismissed(true);
    if (onLoaded) onLoaded();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {/* Fondo inmersivo con flor1.jpg y penumbra cálida de spa */}
          <img
            src="/assets/flor1.jpg"
            alt="Venus Elegant Spa"
            className="preloader-bg-image"
          />
          <div className="preloader-scrim" aria-hidden="true" />

          <div className="preloader-content">
            <motion.span
              className="preloader-tagline"
              initial={{ opacity: 0, letterSpacing: '6px' }}
              animate={{ opacity: 0.95, letterSpacing: '4px' }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Santuario de Bienestar y Quietud
            </motion.span>

            <motion.h1
              className="preloader-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              Venus <em>Elegant Spa</em>
            </motion.h1>

            {/* Línea de carga fina */}
            <div className="preloader-progress-bar">
              <motion.div
                className="preloader-progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>

            {/* Opciones interactivas de entrada: espera a que el usuario presione su botón */}
            {!loadingComplete ? (
              <motion.span
                className="preloader-city"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ duration: 0.4 }}
              >
                Santo Domingo Este — República Dominicana
              </motion.span>
            ) : (
              <motion.div
                className="preloader-actions-group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  className="preloader-btn-sound"
                  onClick={handleEnterWithSound}
                  autoFocus
                >
                  <Volume2 size={15} />
                  <span>Entrar con sonido</span>
                </button>

                <button
                  type="button"
                  className="preloader-btn-silent"
                  onClick={handleEnterSilent}
                >
                  <VolumeX size={13} style={{ display: 'none' }} />
                  <span>Entrar en silencio</span>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
