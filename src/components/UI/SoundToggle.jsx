import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientAudio } from '../../hooks/useAmbientAudio';
import './SoundToggle.css';

/**
 * SoundToggle — Botón flotante discreto de control de audio ambiente
 * Muestra barras de ecualizador finas animadas cuando suena, y línea en reposo cuando está pausado.
 * Se oculta automáticamente si el audio no está disponible o falla.
 */
const SoundToggle = () => {
  const { isPlaying, isAvailable, togglePlay } = useAmbientAudio();

  // Si el audio no está soportado o falló al cargar, el botón se oculta sin romper nada
  if (!isAvailable) return null;

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        onClick={togglePlay}
        className={`sound-toggle-fixed ${isPlaying ? 'is-playing' : 'is-muted'}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-label={isPlaying ? 'Pausar música ambiente' : 'Reproducir música ambiente'}
        title={isPlaying ? 'Pausar música ambiente' : 'Reproducir música ambiente'}
      >
        <div className="sound-eq-visualizer" aria-hidden="true">
          <span className="eq-bar" />
          <span className="eq-bar" />
          <span className="eq-bar" />
          <span className="eq-bar" />
        </div>

        <span className="sound-toggle-label">
          {isPlaying ? 'Sonido' : 'Silencio'}
        </span>
      </motion.button>
    </AnimatePresence>
  );
};

export default SoundToggle;
