
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: '../dist',
    rollupOptions: {
      external: (id) => {
        // Ignorar importaciones con versiones específicas
        if (id.includes('@radix-ui/') && id.includes('@')) return false;
        if (id.includes('class-variance-authority@')) return false;
        if (id.includes('lucide-react@')) return false;
        return false;
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});