/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          DEFAULT: "#8A1538",
          dark: "#E11D48",
        },
        petrol: {
          DEFAULT: "#2C7A7B",
          dark: "#4FD1C5",
        },
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#F6E05E",
        },
        surface: {
          DEFAULT: "#F5F5F7",
          card: "#FFFFFF",
          secondary: "#EEEEF0",
          dark: "#0F172A",
          "dark-card": "#1E293B",
        },
        content: {
          primary: "#1A202C",
          secondary: "#4A5568",
          tertiary: "#A0AEC0",
          "dark-primary": "#F8FAFC",
          "dark-secondary": "#CBD5E1",
        },
        border: {
          DEFAULT: "#E5E5EA",
          dark: "#334155",
        },
      },
    },
  },
  plugins: [],
};
