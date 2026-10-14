import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const PORT = parseInt(env.VITE_PORT || env.PORT || '3000', 10);
  const BACKEND_URL = env.VITE_BACKEND_URL || 'http://192.168.20.8:5005';
  const BACKEND_WS_URL = env.VITE_WS_URL || BACKEND_URL.replace(/^http/, 'ws');

  return {
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    },
    server: {
      port: PORT,
      host: true,
      proxy: {
        '/api': {
          target: BACKEND_URL,
          changeOrigin: true
        },
        '/ws': {
          target: BACKEND_WS_URL,
          ws: true
        }
      }
    }
  };
});
