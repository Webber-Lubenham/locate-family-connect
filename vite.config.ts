import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    host: 'localhost',
    port: 8080,
    strictPort: true,
    hmr: {
      clientPort: 8080
    },
    proxy: {
      '/api': {
        target: 'https://rsvjnndhbyyxktbczlnk.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'https://rsvjnndhbyyxktbczlnk.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/auth/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['btoa', 'traverse'],
      output: {
        globals: {
          'btoa': 'btoa',
          'traverse': 'traverse'
        }
      }
    },
    target: 'es2020'
  },
  optimizeDeps: {
    include: ['lucide-react'],
    esbuildOptions: {
      target: 'es2020',
      define: {
        'global': 'window'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'swagger-ui-react': 'swagger-ui-react/dist/swagger-ui.js'
    }
  },
  plugins: [
    react(),
    componentTagger()
  ],
  worker: {
    format: 'es'
  }
});
