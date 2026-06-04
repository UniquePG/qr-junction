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
          DEFAULT: "#0046a1",
          hover: "#003680",
          50: "#f0f7ff",
          100: "#e0efff",
          500: "#0046a1",
          600: "#003680",
          700: "#002d69",
        },
        secondary: {
          DEFAULT: "#001B50",
        },
        accent: {
          DEFAULT: "#0046a1",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0046a1, #001B50)",
        "gradient-indigo-cyan": "linear-gradient(135deg, #0046a1, #001B50)",
      },
      boxShadow: {
        "primary": "0 4px 14px rgba(0, 70, 161, 0.15)",
        "primary-hover": "0 6px 20px rgba(0, 70, 161, 0.25)",
        "cyan-glow": "0 4px 14px rgba(0, 70, 161, 0.15)",
      },
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
      },
    },
  },
  plugins: [],
};
export default config;

