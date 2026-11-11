import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The CSP has no `data:` in font-src, so fonts must stay real files.
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 800,
  },
});
