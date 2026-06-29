/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1b1b1f",
        parchment: "#f6f1e7",
        podium: "#7a2e2e",
        podiumDark: "#5c2222",
        sage: "#3c5b4e",
        gavel: "#c9a227"
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
