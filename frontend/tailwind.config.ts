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
        // Colores oficiales de la AMGo
        amgo: {
          green: '#009A44',      // Verde oficial (Cuerpo de Quetzalcóatl)
          darkGreen: '#005C29',  // Verde oscuro (Para la parte final del degradado)
          red: '#CE1126',        // Rojo oficial (Lengua/Plumas)
          dark: '#111111',       // Negro suave (Texto y Piedras Negras)
          gray: '#FAFAFA',       // Fondo casi blanco (Para limpieza visual)
        }
      },
      backgroundImage: {
        // Degradados estándar de Next.js
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        
        // NUEVO: Degradado Institucional Mexicano (Usado en el Banner principal)
        "mexican-hero": "linear-gradient(135deg, #009A44 0%, #004D22 100%)",
      },
    },
  },
  plugins: [],
};
export default config;