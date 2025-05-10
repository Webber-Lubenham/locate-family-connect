import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import net from 'net';

// Função para verificar se uma porta está disponível
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    console.log(`[isPortAvailable] Testing port ${port}...`);
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[isPortAvailable] Port ${port} is IN USE (EADDRINUSE).`);
        resolve(false);
      } else {
        console.error(`[isPortAvailable] Error on port ${port}: ${err.message} (Code: ${err.code}). Resolving as busy.`);
        resolve(false); 
      }
    });
    server.once('listening', () => {
      console.log(`[isPortAvailable] Port ${port} is AVAILABLE (listening then closing).`);
      server.close(() => {
        console.log(`[isPortAvailable] Server on port ${port} closed.`);
        resolve(true);
      });
    });
    server.on('close', () => {
      console.log(`[isPortAvailable] Server on port ${port} confirmed closed event.`);
    });
    try {
      server.listen(port, 'localhost');
    } catch (listenError: any) {
      console.error(`[isPortAvailable] Direct error on server.listen for port ${port}: ${listenError.message}. Resolving as busy.`);
      resolve(false);
    }
  });
}

// Função para encontrar uma porta disponível
async function findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
  let port = startPort;
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`[findAvailablePort] Attempt ${i + 1} for port ${port}.`);
    if (await isPortAvailable(port)) {
      console.log(`[findAvailablePort] Port ${port} is available.`);
      return port;
    }
    console.log(`[findAvailablePort] Port ${port} is in use, trying next...`);
    port++;
  }
  console.warn(`[findAvailablePort] Could not find an available port after ${maxAttempts} attempts starting from ${startPort}. Falling back to ${startPort}.`);
  return startPort;
}

// Função assíncrona para criar a configuração do Vite
async function createViteConfig(mode: string): Promise<UserConfig> {
  const preferredPort = 8080;
  console.log(`[createViteConfig] Preferred port is ${preferredPort}. Finding available port...`);
  const availablePort = await findAvailablePort(preferredPort);
  console.log(`[createViteConfig] Using port ${availablePort} for Vite server.`);

  return {
    server: {
      host: "::",
      port: availablePort,
      strictPort: false,
      hmr: {
        clientPort: availablePort
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['lucide-react'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    build: {
      target: 'es2020',
    },
    worker: {
      format: 'es'
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => createViteConfig(mode));
