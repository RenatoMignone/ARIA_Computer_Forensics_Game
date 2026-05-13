import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: process.env.GITHUB_PAGES === 'true'
        ? '/ARIA_Computer_Forensics_Game/'
        : '/',
    plugins: [
        react(),
        tailwindcss(),
    ],
})
