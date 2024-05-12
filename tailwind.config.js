/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      lg: "0.75rem",
      xl: "1rem",
      "2xl": "1.25rem",
      "3xl": "1.5rem",
      "4xl": "1.75rem",
    },
    extend: {
      colors: {
        primary: "#37012B",
        primarybg: "#290120",
      },
      fontFamily: {
        jone: ["Jockey One"],
        mont: ["Montserrat"],
      },
      backgroundImage: {
        btngrad: "linear-gradient(87.03deg, #1EF1A5 -0.04%, #9746FE 99.96%)",
        tabgrad: "linear-gradient(90deg, #22EAA8 2.04%, #944AFC 100%)",
      },
    },
  },
  plugins: [],
};
