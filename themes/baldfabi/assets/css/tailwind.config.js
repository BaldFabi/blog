const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      colors: {
        "baldfabi-accent": "#dbff00",
        "baldfabi-white": "#f0f0f0",
        "baldfabi-dark1": "#222",
        "baldfabi-dark2": "#333",
        "baldfabi-dark3": "#666"
      },
      borderWidth: {
        3: "3px"
      },
      fontFamily: {
        sans: ['"Saira"', ...defaultTheme.fontFamily.sans]
      }
    }
  },
  variants: {},
  plugins: []
};
