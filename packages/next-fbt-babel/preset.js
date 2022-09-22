/** @type {() => import('@babel/core').TransformOptions} */
module.exports = function nextFbtBabelPreset() {
  return {
    presets: [['next/babel', { 'preset-react': { throwIfNamespace: false } }]],
    plugins: ['babel-plugin-fbt', 'babel-plugin-fbt-runtime'],
  };
};
