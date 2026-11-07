import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('public/assets');
const outputDir = path.resolve('public/assets/optimized');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imagesToProcess = [
  {
    input: 'manos2.jpg',
    baseName: 'hero-manos2',
    isHero: true,
  },
  {
    input: 'manos1.jpg',
    baseName: 'hero-manos1',
    isHero: true,
  },
  {
    input: 'manos3.jpg',
    baseName: 'hero-manos3',
    isHero: true,
  },
  {
    input: 'manos4.jpg',
    baseName: 'hero-manos4',
    isHero: true,
  },
  {
    input: 'playa1.jpg',
    baseName: 'hero-playa1',
    isHero: true,
  },
  {
    input: 'pies1.jpg',
    baseName: 'hero-pies1',
    isHero: true,
  },
  {
    input: 'vela1.png',
    baseName: 'hero-vela1',
    isHero: true,
  },
  {
    input: 'relax.jpg',
    baseName: 'hero-relax',
    isHero: true,
  },
  {
    input: 'masaje5.jpg',
    baseName: 'hero-masaje5',
    isHero: true,
  },
  {
    input: 'relax2.jpg',
    baseName: 'about-relax2',
    isHero: false,
  },
  {
    input: 'spa1.jpeg',
    baseName: 'hero-spa-cabina',
    isHero: true,
  },
  {
    input: 'spa2.jpeg',
    baseName: 'hero-spa-lounge',
    isHero: true,
  },
  {
    input: 'recepcion_1.jpeg',
    baseName: 'hero-recepcion-principal',
    isHero: true,
  },
  {
    input: 'spa3.jpeg',
    baseName: 'gallery-spa-relax',
    isHero: false,
  },
  {
    input: 'sala_1.png',
    baseName: 'gallery-sala-privada',
    isHero: false,
  },
  {
    input: 'pixelcreatures-balance-493712_1920.jpg',
    baseName: 'hero-stones-balance',
    isHero: true,
  },
  {
    input: 'pok_rie-sunset-1637376_1920.jpg',
    baseName: 'hero-twilight-tide',
    isHero: true,
  },
  {
    input: 'guvo59-wellness-3688169_1920.jpg',
    baseName: 'about-wellness-still-life',
    isHero: false,
  },
  {
    input: 'eliola-happens-736244_1920.jpg',
    baseName: 'service-relax-hands',
    isHero: false,
  },
  {
    input: 'kian2018-chinese-medicine-3666269_1920.jpg',
    baseName: 'service-deep-tissue',
    isHero: false,
  },
  {
    input: 'socialbutterflymmg-stones-3184610_1920.jpg',
    baseName: 'ritual-hot-stones',
    isHero: false,
  },
  {
    input: 'facial.png',
    baseName: 'service-facial-treatment',
    isHero: false,
  },
  {
    input: 'kranich17-beach-6282284_1920.jpg',
    baseName: 'ritual-arrival-beach',
    isHero: false,
  },
  {
    input: 'kristendawn-beach-2580656_1920.jpg',
    baseName: 'hero-beach-horizon',
    isHero: true,
  },
  {
    input: 'sonja_paetow-candle-1021137_1920.jpg',
    baseName: 'booking-candle-mood',
    isHero: false,
  },
];

async function run() {
  console.log('--- Starting Image Optimization ---');
  const results = [];

  for (const item of imagesToProcess) {
    const inputPath = path.join(inputDir, item.input);
    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}`);
      continue;
    }

    const metadata = await sharp(inputPath).metadata();
    console.log(`Processing ${item.input} (${metadata.width}x${metadata.height})`);

    const sizes = item.isHero
      ? [
          { suffix: '', width: Math.min(2000, metadata.width), quality: 82 },
          { suffix: '-1200w', width: 1200, quality: 80 },
          { suffix: '-768w', width: 768, quality: 78 },
        ]
      : [
          { suffix: '', width: Math.min(1200, metadata.width), quality: 80 },
          { suffix: '-768w', width: 768, quality: 78 },
        ];

    for (const size of sizes) {
      const outputFilename = `${item.baseName}${size.suffix}.webp`;
      const outputPath = path.join(outputDir, outputFilename);

      await sharp(inputPath)
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality, effort: 5 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      results.push({
        file: outputFilename,
        width: size.width,
        sizeKB: `${sizeKB} KB`,
      });
    }
  }

  console.table(results);
  console.log('--- Finished successfully ---');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
