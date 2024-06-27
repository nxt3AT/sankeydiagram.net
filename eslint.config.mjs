import js from "@eslint/js";
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    {
        ignores: ["src/js/d3-sankey-diagram"],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
        }
    }
]
