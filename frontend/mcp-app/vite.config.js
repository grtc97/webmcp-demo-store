import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const SHARED_DIR = fileURLToPath(new URL('../../shared', import.meta.url))
const STOREFRONT_DIR = fileURLToPath(new URL('../storefront/src', import.meta.url))
const INLINE_EVERYTHING_LIMIT = 100_000_000

function buildTagPattern(fileName) {
    const baseName = fileName.split('/').pop()
    return new RegExp(`<(script|link)[^>]*(?:src|href)="[^"]*${baseName}"[^>]*>(</script>)?`)
}

function escapeClosingTags(code) {
    return code.replace(/<\/(script|style)/gi, '<\\/$1')
}

// Folds the entry script and CSS into index.html so the MCP server can serve one file.
function singleFilePlugin() {
    return {
        name: 'single-file',
        enforce: 'post',
        generateBundle(_, bundle) {
            const page = Object.values(bundle).find((file) => file.fileName.endsWith('.html'))
            for (const [fileName, file] of Object.entries(bundle)) {
                if (fileName === page.fileName) {
                    continue
                }
                const isScript = file.type === 'chunk'
                const code = escapeClosingTags(String(isScript ? file.code : file.source))
                const inlineTag = isScript ? `<script type="module">${code}</script>` : `<style>${code}</style>`
                page.source = String(page.source).replace(buildTagPattern(fileName), () => inlineTag)
                delete bundle[fileName]
            }
        },
    }
}

export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    base: './',
    server: { fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] } },
    plugins: [react(), singleFilePlugin()],
    resolve: { alias: { '@shared': SHARED_DIR, '@storefront': STOREFRONT_DIR } },
    build: {
        outDir: '../../dist/mcp-app',
        emptyOutDir: true,
        cssCodeSplit: false,
        assetsInlineLimit: INLINE_EVERYTHING_LIMIT,
        rollupOptions: { output: { inlineDynamicImports: true } },
    },
})
