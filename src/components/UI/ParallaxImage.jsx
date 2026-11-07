import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxImage = ({
  src,
  alt = 'Venus Elegant Spa',
  className = '',
  aspectRatio = '4/5',
  speed = 40,
  priority = false,
}) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.05, 1.12]);

  return (
    <div
      ref={containerRef}
      className={`parallax-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        aspectRatio,
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          y,
          scale,
          width: '100%',
          height: '120%',
          objectFit: 'cover',
          position: 'absolute',
          top: '-10%',
          left: 0,
        }}
      />
      {/* Delicate subtle glass sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 65%, rgba(34, 26, 21, 0.35) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ParallaxImage;
