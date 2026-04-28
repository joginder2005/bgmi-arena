/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#0B0F1A",
          surface: "#101728",
          card: "#111B31",
          border: "#25304D",
          orange: "#FF6A00",
          green: "#4DFF88",
          red: "#FF4D5A",
          yellow: "#F8C146",
          text: "#F4F7FB",
          muted: "#95A0BE",
        },
      },
      fontFamily: {
        sans: ["Rajdhani", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,106,0,0.35), 0 12px 30px rgba(2,6,23,0.45)",
        "glow-green": "0 0 0 1px rgba(77,255,136,0.35), 0 12px 30px rgba(2,6,23,0.45)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top, rgba(255,106,0,0.16), transparent 32%), radial-gradient(circle at 80% 20%, rgba(77,255,136,0.08), transparent 24%), linear-gradient(180deg, #0b0f1a 0%, #090d16 100%)",
      },
    },
  },
  plugins: [],
};
