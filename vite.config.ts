import { URL, fileURLToPath } from "node:url";
import { readdirSync, writeFileSync } from "node:fs";
import { type ServerResponse, IncomingMessage } from "node:http";
import { defineConfig, type Plugin, type Connect } from "vite";
import solidPlugin from "vite-plugin-solid";

const publicDir = "public";

function devToolMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
): void {
  // console.log(req, res);
  next();
}

function buildFileIndex(name: string, dir: string): void {
  const dirents = readdirSync(dir, {
    withFileTypes: true,
    recursive: true,
  });

  const fileIndex = dirents
    .filter((dirent) => dirent.isFile() && dirent.name !== name)
    .map((dirent) => {
      const path = dirent.parentPath.substring(dir.length);
      return `${path}/${dirent.name}`;
    });

  writeFileSync(
    `${publicDir}/${name}`,
    JSON.stringify(fileIndex, null, 2),
    "utf8",
  );
}

function devTools(): Plugin {
  return {
    name: "dev-tools",
    configureServer(server) {
      server.middlewares.use(devToolMiddleware);
    },
    buildStart() {
      buildFileIndex("assetindex.json", "public/assets");
      buildFileIndex("sceneindex.json", "game/scenes");
    },
  };
}

export default defineConfig({
  publicDir,
  server: {
    port: 3033,
    hmr: false,
  },
  build: { target: "esnext" },
  plugins: [solidPlugin(), devTools()],
  resolve: {
    alias: {
      "#/": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
