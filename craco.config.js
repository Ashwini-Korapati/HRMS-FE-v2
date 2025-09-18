/**
 * CRACO configuration to customize PostCSS for CRA.
 */
module.exports = {
  // Defer PostCSS plugins to postcss.config.js so Tailwind v4 runs correctly in CRA
  style: {
    postcss: {
      mode: "file",
    },
  },
};