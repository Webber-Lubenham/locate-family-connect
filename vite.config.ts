import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    server: {
      host: "::",
      port: 8080,
      watch: {
        usePolling: true,
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': {
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || 'http://localhost:54321',
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
      },
    },
  };
});
