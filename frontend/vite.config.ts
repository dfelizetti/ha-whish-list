import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/wishlist-manager-panel.ts"),
      formats: ["es"],
      fileName: () => "wishlist-manager-panel.js",
    },
    outDir: resolve(__dirname, "../custom_components/wishlist_manager/www"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
