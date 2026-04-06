const fs = require('fs');

// HTML
let indexContent = fs.readFileSync('./demo-vite/index.html', 'utf-8');
let scriptStarted;
let swiperInitialized;
indexContent = indexContent
  .replace(/\/images/g, '../assets/images')
  .replace('favicon', '../assets/favicon')
  .replace(
    '<title>',
    `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css">
  <link rel="stylesheet" href="../dist/effect-expo.min.css">
  <link rel="stylesheet" href="./main.css">
  <title>`,
  )
  .replace(
    `<script type="module">`,
    `
  <script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
  <script src="../dist/effect-expo.min.js"></script>
  <script>
`,
  )
  .split('\n')
  .filter((line) => {
    if (line.includes('<script>')) {
      scriptStarted = true;
      return line;
    }
    if (line.includes('new Swiper')) {
      swiperInitialized = true;
      return line;
    }
    if (scriptStarted && !swiperInitialized) return false;
    return line;
  })
  .join('\n');

// CSS
const cssContent = fs.readFileSync('./demo-vite/main.css', 'utf-8');

// JS

// let jsContent = fs.readFileSync('./demo-vite/main.js', 'utf-8');
// jsContent = jsContent
//   .split('\n')
//   .filter(
//     (line) =>
//       !line.startsWith('import') &&
//       !line.startsWith('/**') &&
//       !line.startsWith(' */') &&
//       !line.startsWith(' * ') &&
//       line !== ' *',
//   )
//   .join('\n')
//   .replace(/modules: \[([A-Z0-9a-z, ]*)\]/i, 'modules: [EffectExpo]');

// WRITE
fs.writeFileSync('./demo-static/index.html', indexContent);
fs.writeFileSync('./demo-static/main.css', cssContent);
