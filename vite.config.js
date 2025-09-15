import { defineConfig } from "vite"

export default defineConfig({
    base: "./",
    build: {
        target: ["esnext"],
        rollupOptions: {
            input: "src/run.ts",
            output: {
                entryFileNames: "run.js",
                dir: "dist/module",
            },
        },
        sourcemap: true,
    },
})
