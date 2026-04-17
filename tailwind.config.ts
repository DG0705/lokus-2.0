import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lokus: {
          text: "#2C2B2B",
          secondary: "#D4C4B7",
          accent: "#B58B6B",
          background: "#F9F7F5",
        },
      },
      boxShadow: {
        soft: "0 12px 40px rgba(44, 43, 43, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
