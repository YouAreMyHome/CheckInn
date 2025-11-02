import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@components': resolve(__dirname, './src/shared/components'),
      '@context': resolve(__dirname, './src/shared/context'),
      '@hooks': resolve(__dirname, './src/shared/hooks'),
      '@services': resolve(__dirname, './src/shared/services'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@portals': resolve(__dirname, './src/portals'),
      '@customer': resolve(__dirname, './src/portals/customer'),
      '@admin': resolve(__dirname, './src/portals/admin'),
      '@partner': resolve(__dirname, './src/portals/hotel-manager'),
    }
  }
})
