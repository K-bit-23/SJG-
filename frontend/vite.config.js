import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {} // Simple mock to prevent crash if code uses it
    },
    build: {
        outDir: 'build'
    }
});
