import React from 'react';
import { motion } from 'framer-motion';
import { images } from '../../data/images';
import './TreatedImage.css';

/**
 * TreatedImage — Componente de imagen con Color Grading Unificado
 * Aplica calidez de paleta (crema/terracota/marrón), reducción de saturación,
 * overlay suave en soft-light/multiply, viñeteado periférico y grano de película fino.
 */
const TreatedImage = ({
  imageKey,
  image,
  src,
  srcSet,
  alt,
  focalPoint,
  priority = false,
  aspectRatio,
  interactive = false,
  reveal = false,
  grain = true,
  vignette = true,
  tint = true,
  veil = true,
  className = '',
  imgClassName = '',
  style = {},
  imgStyle = {},
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px',
  ...rest
}) => {
  // Resolver objeto de imagen
  const imgData = (imageKey && images[imageKey]) || image || {};

  const finalSrc = imgData.src || src || '';
  const finalSrcSet = imgData.srcSet || srcSet || '';
  const finalAlt = imgData.alt || alt || 'Venus Elegant Spa';
  const finalFocalPoint = focalPoint || imgData.focalPoint || 'center center';

  const containerStyle = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  const finalImgStyle = {
    objectPosition: finalFocalPoint,
    ...imgStyle,
  };

  const imageElement = (
    <div
      className={`treated-image-container ${className}`}
      style={containerStyle}
      {...rest}
    >
      <img
        src={finalSrc}
        srcSet={finalSrcSet || undefined}
        sizes={finalSrcSet ? sizes : undefined}
        alt={finalAlt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={`treated-image-asset ${interactive ? 'interactive-hover' : ''} ${imgClassName}`}
        style={finalImgStyle}
      />

      {/* Capas de color grading unificado */}
      {tint && <div className="treated-image-tint" aria-hidden="true" />}
      {veil && <div className="treated-image-veil" aria-hidden="true" />}
      {vignette && <div className="treated-image-vignette" aria-hidden="true" />}
      {grain && <div className="treated-image-grain" aria-hidden="true" />}
    </div>
  );

  if (reveal) {
    return (
      <motion.div
        className="treated-image-reveal-wrapper"
        initial={{ clipPath: 'inset(10% 0% 10% 0%)', opacity: 0 }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {imageElement}
      </motion.div>
    );
  }

  return imageElement;
};

export default TreatedImage;
