import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Build optimizasyonları
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          swiper: ['swiper'],
        },
        // Asset optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Source maps for production debugging
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Development server optimizations
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 4173,
    open: true,
  },
  // CSS optimizations
  css: {
    devSourcemap: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'swiper'],
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
})
