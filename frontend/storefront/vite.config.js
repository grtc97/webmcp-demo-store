import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const SHARED_DIR = fileURLToPath(new URL('../../shared', import.meta.url))

export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins: [react()],
    resolve: { alias: { '@shared': SHARED_DIR } },
    server: { port: 5173, open: true, fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
    build: { outDir: '../../dist/storefront', emptyOutDir: true },
})
