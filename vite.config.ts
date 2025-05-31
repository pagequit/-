import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  server: {
    port: 3033,
    hmr: false,
  },
  build: { target: "esnext" },
  plugins: [solidPlugin()],
});
