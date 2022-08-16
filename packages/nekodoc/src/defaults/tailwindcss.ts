import type { Config } from "tailwindcss";

const DEFAULT: Config = {
  content: ["./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

const HEADER: string = "/** @type {import('tailwindcss').Config} */";

export { HEADER, DEFAULT };
