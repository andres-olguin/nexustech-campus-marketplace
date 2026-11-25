import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  // Build para la APK (npm run android:build): si nadie definió VITE_API_BASE_URL,
  // se usa 10.0.2.2, que dentro del emulador de Android es el PC donde corre Docker.
  if (mode === 'android' && !loadEnv(mode, process.cwd(), 'VITE_').VITE_API_BASE_URL) {
    process.env.VITE_API_BASE_URL = 'http://10.0.2.2:3001/api/v1';
  }
  return {
    plugins: [react()],
    base: './',
    // Solo la vista previa de un archivo incrusta las fotografías.
    // En la web, el navegador carga y cachea cada imagen por separado.
    build: { assetsInlineLimit: mode === 'standalone' ? () => true : 4096 },
  };
});
