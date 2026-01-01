import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4361ee",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#4361ee",
          600: "#4f46e5",
          700: "#4338ca",
        },
        secondary: {
          DEFAULT: "#f72585",
        },
        accent: {
          DEFAULT: "#7209b7",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #4361ee, #7209b7)",
      },
      boxShadow: {
        "primary": "0 4px 10px rgba(67, 97, 238, 0.3)",
        "primary-hover": "0 6px 15px rgba(67, 97, 238, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

