import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#FAFAF9",
          card: "#FFFFFF",
          text: "#1C1C1E",
          secondary: "#6E6E73",
          tertiary: "#A1A1A6",
          border: "rgba(0, 0, 0, 0.05)",
          accent: "#3B82F6",
          "accent-soft": "#EAF2FF",
          "accent-hover": "#2563EB",
          success: "#10B981",
          "success-soft": "#D8F0DF",
          warning: "#F59E0B",
          "warning-soft": "#FBF0D9",
          danger: "#EF4444",
          "danger-soft": "#F9E3E1",
          purple: "#8B5CF6",
          "purple-soft": "#F3E8FF",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)",
        "apple-hover": "0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.03)",
        "apple-modal": "0 20px 50px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
