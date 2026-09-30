import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    port: 5173,
    host: mode !== 'production',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 600,

    // ═══ تحسينات الأداء ═══
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Firebase → chunk منفصل
          if (id.includes('firebase')) return 'firebase'
          // Three.js + R3F → chunk منفصل
          if (id.includes('three') || id.includes('@react-three')) return 'three'
          // Charts → chunk منفصل
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          // React vendor
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('react-router')) return 'react-vendor'
          // كل الباقي
          return undefined
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['firebase', 'three', '@react-three/fiber', '@react-three/drei'],
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
  },
}))
