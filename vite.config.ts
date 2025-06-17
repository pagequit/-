import { defineConfig, type Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import { readdirSync, writeFileSync } from "node:fs";

function assetIndexer(): Plugin {
  const indexName = "assetindex.json";
  const publicDir = "public";

  return {
    name: "asset-indexer",
    buildStart() {
      const assets = readdirSync(publicDir, {
        withFileTypes: true,
        recursive: true,
      });
      const index = assets
        .filter((dirent) => dirent.isFile() && dirent.name !== indexName)
        .map((dirent) => {
          const path = dirent.parentPath.substring(publicDir.length);
          return `${path}/${dirent.name}`;
        });

      writeFileSync(
        `${publicDir}/${indexName}`,
        JSON.stringify(index, null, 2),
        "utf8",
      );
    },
  };
}

export default defineConfig({
  server: {
    port: 3033,
    hmr: false,
  },
  build: {
    target: "esnext",
    manifest: "manifest.json",
  },
  plugins: [solidPlugin(), assetIndexer()],
});
