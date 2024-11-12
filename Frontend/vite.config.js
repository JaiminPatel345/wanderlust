import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                // eslint-disable-next-line no-undef
                target: process.env.VITE_API_BASE_URL, // Use the environment variable
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    define: {
        "process.env": process.env,
    },
})
