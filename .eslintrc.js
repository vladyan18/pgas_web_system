module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        //"plugin:security/recommended",
        'google',
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        'max-len': 'off',
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',
        'linebreak-style': 'off',
        'indent': 'off',
        'object-curly-spacing': 'off',
        'new-cap': 'off'
    },
    "plugins": [
       // "security"
    ]
};
