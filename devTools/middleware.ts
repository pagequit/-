import { IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { dev } from "#/config.ts";
import { type SceneData } from "#/lib/Scene.ts";

function get(req: IncomingMessage, res: ServerResponse): void {
  const match = req.url?.match(/\/(\w+)$/);
  if (!match) {
    res.statusCode = 400;
    res.end();
  }

  const sceneData = readFileSync(`${dev.scenesDir}/${match![1]}.json`, "utf8");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(sceneData);
}

function post(req: IncomingMessage, res: ServerResponse): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const data: SceneData = JSON.parse(body);

    writeFileSync(
      `${dev.scenesDir}/${data.name}.json`,
      JSON.stringify(data, null, 2),
      "utf8",
    );

    res.statusCode = 204;
    res.end();
  });
}

export function devToolMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  switch (req.method) {
    case "GET": {
      get(req, res);
      break;
    }
    case "POST": {
      post(req, res);
      break;
    }
  }
}
