import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function getPackageName(id: string) {
  const normalized = id.split('\\\\').join('/');
  const parts = normalized.split('/node_modules/');
  if (parts.length < 2) return null;

  const modulePath = parts[1];
  const segments = modulePath.split('/');

  if (!segments[0]) return null;
  if (segments[0].startsWith('@')) {
    if (!segments[1]) return null;
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0];
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
 base: "/",
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
            const pkg = getPackageName(id);

            if (pkg === "react" || pkg === "react-dom" || pkg === "scheduler" || pkg === "react-router" || pkg === "react-router-dom" || pkg === "@remix-run/router") {
              return "react-core-vendor";
            }

            if (pkg === "@tanstack/react-query") {
              return "query-vendor";
            }

            if (pkg === "lucide-react") {
              return "icons-vendor";
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
              id.includes("canvg")
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

            if (pkg === "zod" || pkg === "date-fns" || pkg === "clsx" || pkg === "class-variance-authority" || pkg === "tailwind-merge") {
              return "utils-vendor";
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
