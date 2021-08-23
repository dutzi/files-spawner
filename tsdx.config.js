module.exports = {
  rollup(config, options) {
    return {
      ...config,
      output: {
        ...config.output,
        banner: '#!/usr/bin/env node',
      },
    };
  },
};
