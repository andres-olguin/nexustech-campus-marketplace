import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './',
  // Solo la vista previa de un archivo incrusta las fotografías.
  // En la web, el navegador carga y cachea cada imagen por separado.
  build: { assetsInlineLimit: mode === 'standalone' ? () => true : 4096 },
}));
