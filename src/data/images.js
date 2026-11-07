/**
 * Venus Elegant Spa — Image Registry & Manifest
 * Fuente única de verdad para todos los recursos visuales del sitio.
 * Cada imagen fotográfica se usa de manera exclusiva una sola vez.
 * Sin imágenes de flores genéricas, priorizando fotos reales y activos de alta calidad.
 */

export const images = {
  // --- HERO SLIDESHOW (Fotos de alta calidad y reales del spa) ---
  heroManos2: {
    key: 'heroManos2',
    src: '/assets/optimized/hero-manos2.webp',
    srcSet: '/assets/optimized/hero-manos2-768w.webp 768w, /assets/optimized/hero-manos2-1200w.webp 1200w, /assets/optimized/hero-manos2.webp 1920w, /assets/manos2.jpg 1920w',
    alt: 'Terapia manual y masaje holístico en Venus Elegant Spa',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Terapia Manual y Masaje Holístico'
  },
  heroManos1: {
    key: 'heroManos1',
    src: '/assets/optimized/hero-manos1.webp',
    srcSet: '/assets/optimized/hero-manos1-768w.webp 768w, /assets/optimized/hero-manos1-1200w.webp 1200w, /assets/optimized/hero-manos1.webp 1920w, /assets/manos1.jpg 1920w',
    alt: 'Cuidado y relajación con técnicas manuales en Venus Elegant Spa',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Terapia Relajante de Manos y Cuidado Profundo'
  },
  heroManos3: {
    key: 'heroManos3',
    src: '/assets/optimized/hero-manos3.webp',
    srcSet: '/assets/optimized/hero-manos3-768w.webp 768w, /assets/optimized/hero-manos3-1200w.webp 1200w, /assets/optimized/hero-manos3.webp 1920w, /assets/manos3.jpg 1920w',
    alt: 'Masaje terapéutico y bienestar corporal en cabina privada',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Masaje Terapéutico y Bienestar Corporal'
  },
  heroManos4: {
    key: 'heroManos4',
    src: '/assets/optimized/hero-manos4.webp',
    srcSet: '/assets/optimized/hero-manos4-768w.webp 768w, /assets/optimized/hero-manos4-1200w.webp 1200w, /assets/optimized/hero-manos4.webp 1920w, /assets/manos4.jpg 1920w',
    alt: 'Técnica de masaje y armonización sensorial en Venus Spa',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Técnica Especializada y Armonía'
  },
  heroPlaya1: {
    key: 'heroPlaya1',
    src: '/assets/optimized/hero-playa1.webp',
    srcSet: '/assets/optimized/hero-playa1-768w.webp 768w, /assets/optimized/hero-playa1-1200w.webp 1200w, /assets/optimized/hero-playa1.webp 1920w, /assets/playa1.jpg 1920w',
    alt: 'Horizonte costero al atardecer y calma marina',
    focalPoint: 'center 50%',
    section: 'hero',
    caption: 'Horizonte Dorado — Calma Marina'
  },
  heroPies1: {
    key: 'heroPies1',
    src: '/assets/optimized/hero-pies1.webp',
    srcSet: '/assets/optimized/hero-pies1-768w.webp 768w, /assets/optimized/hero-pies1-1200w.webp 1200w, /assets/optimized/hero-pies1.webp 1920w, /assets/pies1.jpg 1920w',
    alt: 'Reflexología podal y cuidado relajante de pies en Venus Elegant Spa',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Reflexología Podal y Renovación'
  },
  heroVela1: {
    key: 'heroVela1',
    src: '/assets/optimized/hero-vela1.webp',
    srcSet: '/assets/optimized/hero-vela1-768w.webp 768w, /assets/optimized/hero-vela1-1200w.webp 1200w, /assets/optimized/hero-vela1.webp 1920w, /assets/vela1.jpg 1920w',
    alt: 'Vela aromática y ambiente íntimo de relajación en Venus Spa',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Atmósfera Cálida y Armonía'
  },
  heroRelax: {
    key: 'heroRelax',
    src: '/assets/optimized/hero-relax.webp',
    srcSet: '/assets/optimized/hero-relax-768w.webp 768w, /assets/optimized/hero-relax-1200w.webp 1200w, /assets/optimized/hero-relax.webp 1920w, /assets/relax.jpg 1920w',
    alt: 'Sesión de relajación y desconexión en el spa',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Descanso Profundo y Serenidad'
  },
  heroMasaje5: {
    key: 'heroMasaje5',
    src: '/assets/optimized/hero-masaje5.webp',
    srcSet: '/assets/optimized/hero-masaje5-768w.webp 768w, /assets/optimized/hero-masaje5-1200w.webp 1200w, /assets/optimized/hero-masaje5.webp 1920w, /assets/masaje5.jpg 1920w',
    alt: 'Masaje corporal terapéutico con aceites naturales',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Terapia Corporal Especializada'
  },
  heroSpaCabina: {
    key: 'heroSpaCabina',
    src: '/assets/optimized/hero-spa-cabina.webp',
    srcSet: '/assets/optimized/hero-spa-cabina-768w.webp 768w, /assets/optimized/hero-spa-cabina-1200w.webp 1200w, /assets/optimized/hero-spa-cabina.webp 1600w',
    alt: 'Cabina privada de masajes con camilla blanca, pared de mármol y luz cálida en Venus Elegant Spa',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Cabina Privada — Exclusividad y Confort'
  },
  heroMassage: {
    key: 'heroMassage',
    src: '/assets/optimized/hero-massage-therapy.webp',
    srcSet: '/assets/optimized/hero-massage-therapy-768w.webp 768w, /assets/optimized/hero-massage-therapy-1200w.webp 1200w, /assets/optimized/hero-massage-therapy.webp 1920w',
    alt: 'Sesión de masaje terapéutico con aromaterapia y velas en cabina privada',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Terapia Corporal — Manos Maestras'
  },
  heroRecepcion: {
    key: 'heroRecepcion',
    src: '/assets/optimized/hero-recepcion-principal.webp',
    srcSet: '/assets/optimized/hero-recepcion-principal-768w.webp 768w, /assets/optimized/hero-recepcion-principal-1200w.webp 1200w, /assets/optimized/hero-recepcion-principal.webp 1600w',
    alt: 'Recepción noble de Venus Spa con mostrador de mármol, madera y bienvenida personalizada',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Recepción y Bienvenida — Hospitalidad'
  },
  heroSpaSanctuary: {
    key: 'heroSpaSanctuary',
    src: '/assets/optimized/hero-spa-sanctuary.webp',
    srcSet: '/assets/optimized/hero-spa-sanctuary-768w.webp 768w, /assets/optimized/hero-spa-sanctuary-1200w.webp 1200w, /assets/optimized/hero-spa-sanctuary.webp 1920w',
    alt: 'Santuario de calma arquitectónica con tina de piedra, albornoces y velas tenues',
    focalPoint: 'center 40%',
    section: 'hero',
    caption: 'Santuario de Calma — Diseño y Confort'
  },
  heroBeach: {
    key: 'heroBeach',
    src: '/assets/optimized/hero-beach-horizon.webp',
    srcSet: '/assets/optimized/hero-beach-horizon-768w.webp 768w, /assets/optimized/hero-beach-horizon-1200w.webp 1200w, /assets/optimized/hero-beach-horizon.webp 1920w',
    alt: 'Atardecer sereno en la costa con reflejos dorados y calma absoluta',
    focalPoint: 'center 50%',
    section: 'hero',
    caption: 'Horizonte Dorado — Calma Marina'
  },
  heroStones: {
    key: 'heroStones',
    src: '/assets/optimized/hero-stones-balance.webp',
    srcSet: '/assets/optimized/hero-stones-balance-768w.webp 768w, /assets/optimized/hero-stones-balance-1200w.webp 1200w, /assets/optimized/hero-stones-balance.webp 1280w',
    alt: 'Piedras de río en equilibrio zen a contraluz del crepúsculo',
    focalPoint: 'center 45%',
    section: 'hero',
    caption: 'Equilibrio y Quietud'
  },

  // --- SOBRE NOSOTROS ---
  aboutStillLife: {
    key: 'aboutStillLife',
    src: '/assets/optimized/about-relax2.webp',
    srcSet: '/assets/optimized/about-relax2-768w.webp 768w, /assets/optimized/about-relax2-1200w.webp 1200w, /assets/optimized/about-relax2.webp 1920w, /assets/relax2.jpg 1920w',
    alt: 'Espacio de relajación y calma sensorial en Venus Elegant Spa',
    focalPoint: 'center 45%',
    section: 'about',
    caption: 'Espacio de Calma y Desconexión Total'
  },

  // --- TRATAMIENTOS (Imágenes de alta calidad sin flores repetidas) ---
  serviceRelaxHands: {
    key: 'serviceRelaxHands',
    src: '/assets/optimized/service-relax-hands.webp',
    srcSet: '/assets/optimized/service-relax-hands-768w.webp 768w, /assets/optimized/service-relax-hands.webp 1200w',
    alt: 'Manos expertas en reposo sobre toalla tibia en masaje relajante',
    focalPoint: 'center 50%',
    section: 'services',
    caption: 'Maniobras suaves y fluidas'
  },
  serviceDeepTissue: {
    key: 'serviceDeepTissue',
    src: '/assets/optimized/service-deep-tissue.webp',
    srcSet: '/assets/optimized/service-deep-tissue-768w.webp 768w, /assets/optimized/service-deep-tissue.webp 1200w',
    alt: 'Presión terapéutica descontracturante en espalda para liberación muscular profunda',
    focalPoint: 'center 45%',
    section: 'services',
    caption: 'Liberación de nudos y tensión postural'
  },
  serviceHotStones: {
    key: 'serviceHotStones',
    src: '/assets/optimized/ritual-hot-stones.webp',
    srcSet: '/assets/optimized/ritual-hot-stones-768w.webp 768w, /assets/optimized/ritual-hot-stones.webp 1200w',
    alt: 'Piedras volcánicas calientes alineadas en columna vertebral sobre piel tibia',
    focalPoint: 'center 50%',
    section: 'services',
    caption: 'Termoterapia con basalto volcánico'
  },
  serviceFacial: {
    key: 'serviceFacial',
    src: '/assets/optimized/service-facial-treatment.webp',
    srcSet: '/assets/optimized/service-facial-treatment-768w.webp 768w, /assets/optimized/service-facial-treatment.webp 1200w',
    alt: 'Tratamiento facial profesional con aplicación de mascarilla nutritiva y cosmética clínica',
    focalPoint: 'center 45%',
    section: 'services',
    caption: 'Luminosidad y purificación cutánea'
  },
  serviceMassageLuxury: {
    key: 'serviceMassageLuxury',
    src: '/assets/optimized/hero-massage-therapy.webp',
    srcSet: '/assets/optimized/hero-massage-therapy-768w.webp 768w, /assets/optimized/hero-massage-therapy.webp 1200w',
    alt: 'Masaje signature a cuatro manos con aceites tibios y desconexión absoluta',
    focalPoint: 'center 40%',
    section: 'services',
    caption: 'Signature Luxury y Sincronía'
  },
  serviceSensoryCandle: {
    key: 'serviceSensoryCandle',
    src: '/assets/optimized/hero-vela1.webp',
    srcSet: '/assets/optimized/hero-vela1-768w.webp 768w, /assets/optimized/hero-vela1-1200w.webp 1200w, /assets/optimized/hero-vela1.webp 1920w, /assets/vela1.jpg 1920w',
    alt: 'Vela aromática y atmósfera tenue de desconexión en Venus Spa',
    focalPoint: 'center 45%',
    section: 'services',
    caption: 'Ambiente sensorial íntimo'
  },

  // --- EL RITUAL (4 Pasos de transformación con fotos de autor exclusivas) ---
  ritualArrival: {
    key: 'ritualArrival',
    src: '/assets/nuevo1.jpg',
    srcSet: '/assets/nuevo1.jpg 1200w',
    alt: 'Paso 01 La Llegada: Bienvenida privada, atmósfera cálida y desconexión inmediata',
    focalPoint: 'center 45%',
    section: 'experience',
    step: '01'
  },
  ritualPreparation: {
    key: 'ritualPreparation',
    src: '/assets/nuevo2.jpg',
    srcSet: '/assets/nuevo2.jpg 1200w',
    alt: 'Paso 02 El Ritual: Lounge sensorial con iluminación cálida, plantas y texturas nobles de madera',
    focalPoint: '65% 25%',
    section: 'experience',
    step: '02'
  },
  ritualTherapy: {
    key: 'ritualTherapy',
    src: '/assets/nuevo3.jpg',
    srcSet: '/assets/nuevo3.jpg 1200w',
    alt: 'Paso 03 La Terapia: Tacto rítmico maestro, aceites tibios y relajación muscular profunda',
    focalPoint: 'center 45%',
    section: 'experience',
    step: '03'
  },
  ritualRenewal: {
    key: 'ritualRenewal',
    src: '/assets/nuevo4.jpg',
    srcSet: '/assets/nuevo4.jpg 1200w',
    alt: 'Paso 04 La Renovación: Despertar sereno, plenitud y ligereza absoluta',
    focalPoint: 'center 50%',
    section: 'experience',
    step: '04'
  },

  // --- OPINIONES & TESTIMONIOS (Fondo tenue nocturno sin flores) ---
  testimonialsBackdrop: {
    key: 'testimonialsBackdrop',
    src: '/assets/optimized/hero-twilight-tide.webp',
    srcSet: '/assets/optimized/hero-twilight-tide-768w.webp 768w, /assets/optimized/hero-twilight-tide.webp 1200w',
    alt: 'Textura nocturna serena al crepúsculo con penumbra elegante',
    focalPoint: 'center center',
    section: 'testimonials'
  },

  // --- RESERVAS (Atmósfera arquitectónica) ---
  bookingAmbience: {
    key: 'bookingAmbience',
    src: '/assets/optimized/hero-spa-sanctuary.webp',
    srcSet: '/assets/optimized/hero-spa-sanctuary-768w.webp 768w, /assets/optimized/hero-spa-sanctuary.webp 1200w',
    alt: 'Santuario privado con iluminación cálida tenue y serenidad',
    focalPoint: 'center 40%',
    section: 'booking'
  },

  // --- AUDIO AMBIENTAL ---
  ambientAudio: {
    src: '/assets/ambient-spa-harmony.mp3',
    title: 'Sanchii — Equilibrium (Atmospheric Wellness Loop)',
    bitrate: '128 kbps',
    targetVolume: 0.22,
    fadeDurationMs: 3000
  }
};

// Aliases para máxima compatibilidad con componentes existentes
images.heroSlide1 = images.heroSpaCabina;
images.heroSlide2 = images.heroMassage;
images.heroSlide3 = images.heroRecepcion;
images.heroSlide4 = images.heroSpaSanctuary;
images.heroSlide5 = images.heroBeach;
images.serviceFacialFlora = images.serviceFacial;

/**
 * Obtener objeto de imagen por su clave
 * @param {string} key 
 * @returns {object|null}
 */
export const getImage = (key) => images[key] || null;

export default images;
