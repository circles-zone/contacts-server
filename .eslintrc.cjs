// This is the configuration file for the lint
// If you have this error "ESLint couldn't find a configuration file. To set up a configuration file for this project" please make sure you have this file

// This file is instead of .eslintrc.yml

module.exports = {
    env: {browser: true, es2020: true, node: true},
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {ecmaVersion: 'latest', sourceType: 'module'},
    plugins: ["@typescript-eslint"],
}
