const emotionPresetOptions = {};
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

const disableModuleScopePlugin = {
  overrideWebpackConfig: ({ webpackConfig }) => {
    webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin),
    );

    return webpackConfig;
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
  webpack: {
    plugins: [
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
      }),
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          level: 11,
        },
      }),
    ],
  },
  plugins: [
    { plugin: disableModuleScopePlugin },
  ],
};
