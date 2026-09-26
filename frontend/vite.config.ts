import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    
    // ✅ host: true فقط في التطوير (للاختبار على الجوال)
    host: process.env.NODE_ENV !== 'production',
    
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    
    // ✅ تحسينات البناء
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    
    // ✅ ضغط أفضل
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },

  // ✅ تحسينات إضافية
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
