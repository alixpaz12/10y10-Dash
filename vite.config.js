/*
 * RUTA DEL ARCHIVO: vite.config.js
 * DESCRIPCIÓN: Se ha corregido la configuración eliminando 'autoprefixer' del
 * array de plugins de Vite. El plugin '@tailwindcss/vite' ya gestiona
 * autoprefixer internamente, y añadirlo manualmente causaba el error.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Esta importación es correcta para Tailwind v4

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Esta es la forma correcta de usar el plugin de Tailwind para Vite
    // Se elimina 'autoprefixer()' de aquí.
  ],
})
