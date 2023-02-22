/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    screens: {
      xs: "480px",
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [require("daisyui"), require("@headlessui/tailwindcss")],
  daisyui: {
    styled: true,
    themes: [
      {
        light: {
          primary: "#047857", // emerald-700
          "primary-content": "#fff",
          secondary: "#111827", // gray-900
          "secondary-content": "#fff",
          accent: "#d1d5db", // gray-300
          neutral: "#6b7280", // gray-500
          "base-100": "#fff",
          "base-200": "#e5e7eb", // gray-200
          "base-300": "#d1d5db", // gray-300
          info: "#d1fae5", // emerald-100
          "info-content": "#047857", // emerald-700
          success: "#d1fae5", // emerald-100
          "success-content": "#047857", //emerald-700
          warning: "#fef9c3", // yellow-100
          "warning-content": "#a16207", // yellow-700
          error: "#fee2e2", // red-100
          "error-content": "#b91c1c", //red-700

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
        dark: {
          primary: "#047857", // emerald-700
          "primary-content": "#fff",
          secondary: "#f5f5f5", // neutral-100
          "secondary-content": "#000",
          accent: "#404040", // neutral-700
          neutral: "#737373", // neutral-500
          "neutral-content": "#fff",
          "base-100": "#171717", // neutral-900
          "base-200": "#262626", // neutral-800
          "base-300": "#404040", // neutral-700
          info: "#404040", // base-300
          "info-content": "#fff",
          success: "#404040", // base-300
          "success-content": "#10b981", //emerald-500
          warning: "#404040", // base-300
          "warning-content": "#eab308", // yellow-500
          error: "#404040", // base-300
          "error-content": "#ef4444", //red-500

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
};
