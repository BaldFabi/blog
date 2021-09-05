const themeDir = __dirname + "/../../";
const { join } = require("path");

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [join(themeDir, "layouts/**/*.html")],
  extractors: [
    {
      extractor: (content) => JSON.parse(content).htmlElements.classes,
      extensions: ["json"]
    }
  ]
});

module.exports = {
  plugins: [
    require("postcss-import")({
      path: [themeDir]
    }),
    require("tailwindcss")(themeDir + "assets/css/tailwind.config.js"),
    require("autoprefixer")({
      path: [themeDir]
    }),
    ...(process.env.HUGO_ENVIRONMENT === "production" ? [purgecss] : [])
  ]
};
