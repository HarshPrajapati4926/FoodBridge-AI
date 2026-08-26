/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Greens pulled from the FoodBridge AI wordmark
        brand: {
          50: "#f1f9ee",
          100: "#e0f2da",
          200: "#c1e3b4",
          300: "#98cd82",
          400: "#6cb654",
          500: "#3f9c30",
          600: "#2f8025",
          700: "#26661f",
          800: "#1f521c",
          900: "#173d16",
        },
        // Oranges pulled from the map-pin heart and the "AI" chip
        accent: {
          50: "#fff5e9",
          100: "#ffe6c2",
          200: "#ffcb85",
          300: "#ffab4a",
          400: "#fb8f24",
          500: "#f2790f",
          600: "#d3630a",
          700: "#ab4d0a",
          800: "#853d0d",
          900: "#66300d",
        },
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
