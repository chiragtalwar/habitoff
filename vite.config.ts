import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const copyAssetsPlugin = () => ({
  name: 'copy-assets',
  closeBundle: () => {
    if (!existsSync('dist/icons')) {
      mkdirSync('dist/icons', { recursive: true });
    }
    // Copy manifest and icons
    copyFileSync('public/manifest.json', 'dist/manifest.json');
    ['16', '48', '128'].forEach(size => {
      copyFileSync(`public/icons/icon${size}.png`, `dist/icons/icon${size}.png`);
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyAssetsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  publicDir: 'public',
})
