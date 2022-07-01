module.exports = {
  'env': {
    'browser': false,
    'node': true,
    'commonjs': true,
    'es6': true,
    'mocha': true,
  },
  'extends': ['eslint:recommended', 'google'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'max-len': [1, {'code': 120, 'tabWidth': 2}],
    'indent': ['error', 2],
    'require-jsdoc': ['error', {
      'require': {
          'FunctionDeclaration': false,
          'MethodDefinition': false,
          'ClassDeclaration': false,
          'ArrowFunctionExpression': false,
          'FunctionExpression': false
      }
    }],
    'no-invalid-this': [0],
    'quote-props': [0],
    'new-cap': 'off',
    'comma-dangle': [0],
    'no-prototype-builtins': [0],
    'no-control-regex': [0],
    'no-multiple-empty-lines': [
      "error", {
        'max': 1,
        'maxBOF': 0,
        'maxEOF': 0,
      },
    ],
    'no-unused-vars': ['warn', {
      'varsIgnorePattern': '^_$',
      'argsIgnorePattern': '^_$',
    }],
  },
};
