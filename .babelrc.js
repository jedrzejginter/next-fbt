/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  presets: [['next/babel', { 'preset-react': { throwIfNamespace: false } }]],
  plugins: ['babel-plugin-fbt-import', 'babel-plugin-fbt', 'babel-plugin-fbt-runtime'],
};
