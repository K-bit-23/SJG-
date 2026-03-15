import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {} 
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
