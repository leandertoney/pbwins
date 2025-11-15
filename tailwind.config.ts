import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#7BFF4A",
        emerald: {
          500: "#7BFF4A",
          600: "#6DE639",
          700: "#5FCC2F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
