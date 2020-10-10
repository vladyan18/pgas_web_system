module.exports = {
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'google',
    'plugin:react/recommended',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
  ],

  'rules': {
    'max-len': 'off',
    'react/prop-types': 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'linebreak-style': 'off',
    'indent': 'off',
    'object-curly-spacing': 'off',
    'new-cap': 'off'
  },
};
