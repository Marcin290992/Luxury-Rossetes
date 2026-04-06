const fs = require('fs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const path = require('path');
const { rollup } = require('rollup');
const Terser = require('terser');
const banner = require('./banner');

const buildJs = async () => {
  const bundle = await rollup({
    input: path.resolve(__dirname, '../demo-vite/effect-expo.esm.js'),
    plugins: [nodeResolve()],
  });
  const bundleResult = await bundle.write({
    format: 'umd',
    name: 'EffectExpo',
    strict: true,
    sourcemap: true,
    sourcemapFile: path.resolve(__dirname, '../dist/effect-expo.js.map'),
    file: path.resolve(__dirname, '../dist/effect-expo.js'),
    banner,
  });
  const result = bundleResult.output[0];
  const { code, map } = await Terser.minify(result.code, {
    sourceMap: {
      content: result.map,
      filename: `effect-expo.min.js`,
      url: `effect-expo.min.js.map`,
    },
    output: {
      preamble: banner,
    },
  }).catch((err) => {
    console.error(`Terser failed on file effect-expo: ${err.toString()}`);
  });

  fs.writeFileSync(path.resolve(__dirname, `../dist/effect-expo.min.js`), code);
  fs.writeFileSync(
    path.resolve(__dirname, `../dist/effect-expo.min.js.map`),
    map,
  );

  const file = path.resolve(__dirname, `../demo-vite/effect-expo.esm.js`);
  const content = fs.readFileSync(file, 'utf-8');
  fs.writeFileSync(
    path.resolve(__dirname, '../dist/effect-expo.esm.js'),
    `${banner}\n${content}`,
  );
};
module.exports = buildJs;
