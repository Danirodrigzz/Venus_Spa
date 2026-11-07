import React from 'react';
import { motion } from 'framer-motion';

const RevealText = ({
  text = '',
  tag = 'h2',
  className = '',
  delay = 0,
  stagger = 0.04,
  by = 'words', // 'words' | 'chars'
}) => {
  const Component = tag;
  const items = by === 'chars' ? text.split('') : text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: '110%',
      opacity: 0,
      rotateZ: 2,
    },
    visible: {
      y: '0%',
      opacity: 1,
      rotateZ: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        style={{ display: 'inline-flex', flexWrap: 'wrap', overflow: 'hidden' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {items.map((item, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              marginRight: by === 'words' ? '0.32em' : '0em',
              verticalAlign: 'bottom',
            }}
          >
            <motion.span
              style={{ display: 'inline-block' }}
              variants={itemVariants}
            >
              {item === ' ' ? '\u00A0' : item}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
};

export default RevealText;
