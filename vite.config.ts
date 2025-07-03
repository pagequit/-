import { fileURLToPath, URL } from "node:url";
import { readdirSync, writeFileSync } from "node:fs";
import { IncomingMessage, type ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import { dev } from "#/config";

function devToolMiddleware(req: IncomingMessage, res: ServerResponse): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const data = JSON.parse(body);

    writeFileSync(
      `${dev.scenesDir}/${data.name}.json`,
      JSON.stringify(data.tilemap, null, 2),
      "utf8",
    );

    res.statusCode = 204;
    res.end();
  });
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
    `${dev.publicDir}/${name}`,
    JSON.stringify(fileIndex, null, 2),
    "utf8",
  );
}

function devTools(): Plugin {
  return {
    name: "dev-tools",
    configureServer(server) {
      server.middlewares.use("/dev", devToolMiddleware);
    },
    buildStart() {
      buildFileIndex("assetindex.json", dev.assetsDir);
      buildFileIndex("sceneindex.json", dev.scenesDir);
    },
  };
}

export default defineConfig({
  publicDir: dev.publicDir,
  server: {
    host: dev.host,
    port: dev.port,
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
