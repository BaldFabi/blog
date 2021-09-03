const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      colors: {
        "baldfabi-accent": "#F6F740",
        "baldfabi-white": "#d0d0d0",
        "baldfabi-dark1": "#222",
        "baldfabi-dark2": "#333",
        "baldfabi-dark3": "#666"
      },
      borderWidth: {
        3: "3px"
      },
      fontFamily: {
        sans: ['"Saira"', ...defaultTheme.fontFamily.sans]
      },
      minWidth: {
        96: "24rem"
      }
    }
  },
  variants: {},
  plugins: []
};
