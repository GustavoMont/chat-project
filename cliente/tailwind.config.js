/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#eab308",
          secondary: "#9a3412",
          accent: "#1fb2a6",
          neutral: "#2a323c",
          "base-100": "#f3f4f6",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },

  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
