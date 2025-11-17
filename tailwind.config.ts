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
        brand: withOpacityValue("--brand-green") as any,
        "brand-light": withOpacityValue("--brand-green-light") as any,
        "brand-dark": withOpacityValue("--brand-green-dark") as any,
        "brand-muted": withOpacityValue("--brand-green-muted") as any,
        "brand-glow": withOpacityValue("--brand-green-glow") as any,
      },
    },
  },
  plugins: [],
};
export default config;
