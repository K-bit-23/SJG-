import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: './',
    plugins: [react()],
    define: {
        'process.env': {} 
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api') // Django expects /api/
            }
        }
    },
    build: {
        outDir: 'build'
    },
    esbuild: {
        loader: 'jsx',
        include: /(src|client|admin)\/.*\.js$/,
        exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
});
