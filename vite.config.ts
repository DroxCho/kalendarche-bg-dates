import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
 server: {
   host: "::",
   port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "i18n-vendor";
            }
            if (
              id.includes("jspdf")
            ) {
              return "jspdf-vendor";
            }
            if (
              id.includes("html2canvas") ||
              id.includes("canvg") ||
              id.includes("pako")
            ) {
              return "print-vendor";
            }
            if (
              id.includes("react-markdown") ||
              id.includes("remark") ||
              id.includes("rehype") ||
              id.includes("micromark") ||
              id.includes("mdast") ||
              id.includes("hast") ||
              id.includes("unist") ||
              id.includes("vfile")
            ) {
              return "markdown-vendor";
            }
            if (id.includes("@radix-ui")) {
              return "radix-vendor";
            }
            return "vendor";
          }

          if (id.includes("/src/data/")) {
            return "calendar-data";
          }

          if (id.includes("/src/lib/pdfExport") || id.includes("html2canvas") || id.includes("jspdf")) {
            return "print-vendor";
          }
        },
      },
    },
  },
}));
