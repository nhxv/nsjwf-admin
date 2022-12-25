/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
    },
    screens: {
      "xs": "420px",
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    styled: true,
    themes: [
      {
        mytheme: {
          "primary": "#059669", // bg-emerald-600
          "secondary": "#1f2937", // bg-gray-800
          "accent": "#d1d5db", // bg-gray-400
          "base-100": "#fff",
          "base-200": "#f3f4f6", // bg-gray-100
          "base-300": "#e5e7eb", // bg-gray-200
          "info": "#dbeafe", // bg-blue-100
          "success": "#d1fae5", // bg-emerald-100
          "warning": "#fef9c3", // bg-yellow-100
          "error": "#fee2e2", // bg-red-100

          "--rounded-box": "0.625rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0.5rem", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": "1.9rem", // border radius rounded-badge utility class, used in badges and similar
          "--animation-btn": "0.25s", // duration of animation when you click on button
          "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          "--btn-text-case": "none", // set default text transform for buttons
          "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
          "--border-btn": "1px", // border width of buttons
          "--tab-border": "1px", // border width of tabs
          "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
}
