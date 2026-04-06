const path = require('path');
const fs = require('fs');
const CleanCSS = require('clean-css');
const banner = require('./banner');

const buildCss = async () => {
  const src = path.resolve(__dirname, '../demo-vite/effect-expo.css');
  const css = fs.readFileSync(src, 'utf-8');

  fs.writeFileSync(
    path.resolve(__dirname, '../dist/effect-expo.css'),
    `${banner}\n${css}`,
  );

  const minified = new CleanCSS({
    compatibility: '*,-properties.zeroUnits',
  }).minify(css);

  fs.writeFileSync(
    path.resolve(__dirname, '../dist/effect-expo.min.css'),
    minified.styles,
  );
};
module.exports = buildCss;
