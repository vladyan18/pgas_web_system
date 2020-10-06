const emotionPresetOptions = {};
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')

const disableModuleScopePlugin = {
  overrideWebpackConfig: ({ webpackConfig }) => {
    webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
    );

    return webpackConfig
  },
};

const emotionBabelPreset = require('@emotion/babel-preset-css-prop').default(
    undefined,
    emotionPresetOptions,
);

module.exports = {
  babel: {
    plugins: [
      ...emotionBabelPreset.plugins,
      // your other plugins
    ],
  },
  plugins: [
    { plugin: disableModuleScopePlugin, }
  ]
};
