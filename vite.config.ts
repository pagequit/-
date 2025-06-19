import { defineConfig, type Plugin, type Connect } from "vite";
import solidPlugin from "vite-plugin-solid";
import { readdirSync, writeFileSync } from "node:fs";
import { type ServerResponse, IncomingMessage } from "node:http";

function devToolMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
): void {
  // console.log(req, res);
  next();
}

function devTools(): Plugin {
  const assetIndex = "index.json";
  const assetsDir = "public/assets";

  return {
    name: "dev-tools",
    configureServer(server) {
      server.middlewares.use(devToolMiddleware);
    },
    buildStart() {
      const assets = readdirSync(assetsDir, {
        withFileTypes: true,
        recursive: true,
      });
      const index = assets
        .filter((dirent) => dirent.isFile() && dirent.name !== assetIndex)
        .map((dirent) => {
          const path = dirent.parentPath.substring(assetsDir.length);
          return `${path}/${dirent.name}`;
        });

      writeFileSync(
        `${assetsDir}/${assetIndex}`,
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
  build: { target: "esnext" },
  plugins: [solidPlugin(), devTools()],
});
