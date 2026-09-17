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
        brand: {
          blue: "#2563EB",       // Azul Principal (Acciones principales, focus, botones)
          darkBlue: "#1E3A8A",   // Azul Oscuro (Títulos, elementos destacados)
          green: "#107C41",      // Verde Excel (PRs, series completadas, racha)
          orange: "#D83B01",     // Naranja PowerPoint (Entrenamiento activo, timer)
          purple: "#6264A7",     // Morado Teams (IA, escaneo de máquina)
          red: "#D13438",        // Rojo Alerta (Eliminación, errores)
          bg: "#F5F6F8",         // Fondo General (Gris neutro M365)
          card: "#FFFFFF",       // Superficie de tarjetas
          border: "#E5E7EB",     // Bordes suaves
          textPrimary: "#1F2937", // Texto principal
          textSecondary: "#6B7280"// Texto secundario
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 2px 5px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        modal: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      },
      borderRadius: {
        md: "8px",
        lg: "10px",
        xl: "12px"
      }
    },
  },
  plugins: [],
};
export default config;