import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Own port so it never collides with another dev server, and strictPort so it
  // fails loudly instead of silently picking another one.
  server: { port: 38921, strictPort: true },
  resolve: {
    alias: {
      boardkey: path.resolve(__dirname, '../src'),
    },
  },
})
