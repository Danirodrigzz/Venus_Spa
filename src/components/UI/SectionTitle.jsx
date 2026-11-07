import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle = ({
  number,
  tag,
  title,
  italicTitle,
  description,
  align = 'left', // 'left' | 'center'
  className = '',
  light = false,
}) => {
  const isCenter = align === 'center';
  const titleColor = light ? '#FAF6F0' : 'var(--text-main)';
  const accentColor = light ? 'rgba(211, 139, 87, 0.9)' : 'var(--primary)';
  const mutedColor = light ? 'rgba(250, 246, 240, 0.55)' : 'var(--text-muted)';
  const kickerColor = light ? 'rgba(211, 139, 87, 0.85)' : 'var(--primary)';

  return (
    <div
      className={`section-header-editorial ${className}`}
      style={{
        textAlign: isCenter ? 'center' : 'left',
        marginBottom: 'clamp(28px, 4.5vw, 64px)',
        maxWidth: isCenter ? '820px' : '760px',
        marginInline: isCenter ? 'auto' : '0',
      }}
    >
      {/* Kicker line */}
      <motion.div
        className="editorial-kicker"
        style={{
          justifyContent: isCenter ? 'center' : 'flex-start',
          color: kickerColor,
          opacity: 1,
        }}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {number && <span style={{ opacity: 0.6 }}>{number}</span>}
        {tag && <span>{tag}</span>}
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.85rem, 4.8vw, 4.2rem)',
          fontWeight: 300,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          color: titleColor,
          marginBottom: description ? '20px' : '0',
          opacity: 1,
        }}
      >
        {title}{' '}
        {italicTitle && (
          <em style={{ color: accentColor, fontStyle: 'italic', opacity: 1 }}>
            {italicTitle}
          </em>
        )}
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: '1.02rem',
            lineHeight: 1.88,
            color: mutedColor,
            marginInline: isCenter ? 'auto' : '0',
            maxWidth: '54ch',
            opacity: 1,
          }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionTitle;
