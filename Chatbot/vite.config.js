import { defineConfig } from "vite"

export default defineConfig({
	// Proxy API requests to Express backend during development
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3002",
				changeOrigin: true,
				secure: false
			},
		},
	}
})