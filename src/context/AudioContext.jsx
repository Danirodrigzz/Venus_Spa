import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { images } from '../data/images';

const AudioContext = createContext(null);

const STORAGE_KEY = 'venus_ambient_sound_pref';
const TARGET_VOLUME = 0.22;
const FADE_IN_DURATION = 3000;
const FADE_OUT_DURATION = 800;

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const wasPlayingBeforeHiddenRef = useRef(false);

  // Inicializar elemento de audio en cliente
  useEffect(() => {
    try {
      const audioSrc = images.ambientAudio?.src || '/assets/ambient-spa-harmony.mp3';
      const audio = new Audio(audioSrc);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = 0;

      audio.onerror = () => {
        console.warn('Audio ambiental no disponible o bloqueado por el entorno.');
        setIsAvailable(false);
        setIsPlaying(false);
      };

      audioRef.current = audio;
    } catch (err) {
      console.warn('Error inicializando audio:', err);
      setIsAvailable(false);
    }

    // Manejar visibilidad de pestaña (pausa al ocultar, reanuda al volver)
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          wasPlayingBeforeHiddenRef.current = true;
          fadeOutAndPause(400);
        } else {
          wasPlayingBeforeHiddenRef.current = false;
        }
      } else {
        if (wasPlayingBeforeHiddenRef.current) {
          wasPlayingBeforeHiddenRef.current = false;
          playWithFadeIn(1800);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Fade in progresivo (0 -> TARGET_VOLUME en fadeDuration ms)
  const playWithFadeIn = (fadeDuration = FADE_IN_DURATION) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audio.volume = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          const steps = 30;
          const stepTime = fadeDuration / steps;
          const volumeIncrement = TARGET_VOLUME / steps;

          fadeIntervalRef.current = setInterval(() => {
            if (!audio) return;
            if (audio.volume + volumeIncrement >= TARGET_VOLUME) {
              audio.volume = TARGET_VOLUME;
              clearInterval(fadeIntervalRef.current);
            } else {
              audio.volume = Math.min(TARGET_VOLUME, audio.volume + volumeIncrement);
            }
          }, stepTime);
        })
        .catch((err) => {
          console.warn('Autoplay bloqueado por navegador:', err);
          setIsPlaying(false);
        });
    }
  };

  // Fade out suave (TARGET_VOLUME -> 0 en fadeDuration ms)
  const fadeOutAndPause = (fadeDuration = FADE_OUT_DURATION) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const steps = 20;
    const stepTime = fadeDuration / steps;
    const currentVol = audio.volume;
    const volumeDecrement = currentVol / steps;

    fadeIntervalRef.current = setInterval(() => {
      if (!audio) return;
      if (audio.volume - volumeDecrement <= 0.01) {
        audio.volume = 0;
        audio.pause();
        setIsPlaying(false);
        clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = Math.max(0, audio.volume - volumeDecrement);
      }
    }, stepTime);
  };

  // Entrada con sonido (desde el preloader)
  const enterWithSound = () => {
    setHasInteracted(true);
    localStorage.setItem(STORAGE_KEY, 'sound');
    playWithFadeIn(FADE_IN_DURATION);
  };

  // Entrada en silencio (desde el preloader)
  const enterSilent = () => {
    setHasInteracted(true);
    localStorage.setItem(STORAGE_KEY, 'silent');
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.volume = 0;
    }
    setIsPlaying(false);
  };

  // Alternar reproducción desde el SoundToggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      localStorage.setItem(STORAGE_KEY, 'silent');
      fadeOutAndPause(FADE_OUT_DURATION);
    } else {
      localStorage.setItem(STORAGE_KEY, 'sound');
      playWithFadeIn(1500);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isAvailable,
        hasInteracted,
        enterWithSound,
        enterSilent,
        togglePlay,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAmbientAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAmbientAudio debe utilizarse dentro de un AudioProvider');
  }
  return context;
};

export default AudioContext;
