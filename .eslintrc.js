module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es2020': true,
    'jquery': true,
    'jest': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module'
  },
  'rules': {
    'indent': ['warn', 2, { 'SwitchCase': 1 }],
    'quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'semi': ['warn'],
    'no-unused-vars': ['warn']
  }
};
