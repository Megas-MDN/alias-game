const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        io: "readonly",
      },
      rules: {
        "no-unused-vars": ["error", { "argsIgnorePattern": "^next$" }]
      },
    },
  },
  pluginJs.configs.recommended,
];

