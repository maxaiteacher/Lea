import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f1f8f2",
          100: "#dcefdf",
          500: "#4c9a5b",
          600: "#3d8049",
          700: "#33683d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
