/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Space Grotesk'", "sans-serif"],
      },
      colors: {
        arc: {
          50:  "#eef3ff",
          100: "#dce7ff",
          200: "#b8ccff",
          300: "#7aa1ff",
          400: "#3d72fc",
          500: "#1a4ef4",
          600: "#0c32e0",
          700: "#0a27b5",
          800: "#0e2293",
          900: "#111f77",
          950: "#0b1348",
        },
        dark: {
          900: "#080c18",
          800: "#0d1224",
          700: "#131830",
          600: "#1a203e",
          500: "#232c4e",
          400: "#2e3a62",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(26, 78, 244, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(26, 78, 244, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
