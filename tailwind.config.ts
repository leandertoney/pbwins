import type { Config } from "tailwindcss";

const withOpacityValue = (variable: string) => {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}))`;
  };
};

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
        brand: withOpacityValue("--brand-green"),
        "brand-light": withOpacityValue("--brand-green-light"),
        "brand-dark": withOpacityValue("--brand-green-dark"),
        "brand-muted": withOpacityValue("--brand-green-muted"),
        "brand-glow": withOpacityValue("--brand-green-glow"),
      },
    },
  },
  plugins: [],
};
export default config;
