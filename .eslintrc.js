module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 0,
    'no-unused-vars': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'function-paren-newline': ['error', 'consistent'],
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
};
