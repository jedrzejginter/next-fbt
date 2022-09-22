/** @type {import('npm-check-updates').RunOptions} */
module.exports = {
  removeRange: true,
  target: (packageName) => {
    // We should install types for used version of Node (v16)
    // instead of the latest one.
    if (packageName === '@types/node') {
      return 'minor';
    }

    return 'latest';
  },
};
