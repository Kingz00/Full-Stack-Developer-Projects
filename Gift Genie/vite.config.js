import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        // Proxy API requests to Express backend during development
        server: {
            proxy: {
                "/api": {
                    target: "http://localhost:8000",
                    changeOrigin: true,
                    secure: false
                },
            },
        }
    };
});
