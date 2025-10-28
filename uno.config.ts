import { defineConfig, presetWind4, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons(),
  ],
  transformers: [transformerDirectives()],
  theme: {
    font: {
      trajan: ['TrajanPro', 'serif'],
    },
  },
  preflights: [
    {
      getCSS: () =>
        `
        :root {
          --font-trajan: "TrajanPro", serif;
        }
        @font-face {
          font-family: "TrajanPro";
          src: url("/assets/fonts/TrajanPro-Regular.woff2")format("woff2"),
            url("/assets/fonts/TrajanPro-Regular.woff")format("woff");
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: "TrajanPro";
          src: url("/assets/fonts/TrajanPro-Bold.woff2")format("woff2"),
            url("/assets/fonts/TrajanPro-Bold.woff")format("woff");
          font-weight: bold;
          font-style: normal;
        }
        `,
    },
  ],
})
