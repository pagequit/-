import { dev } from "#/config";
import { IncomingMessage, type ServerResponse } from "node:http";
import { writeFileSync } from "node:fs";
import { type SceneData } from "#/lib/Scene.ts";

export function devToolMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const data: SceneData = JSON.parse(body);

    writeFileSync(
      `${dev.scenesDir}/${data.name}.json`,
      JSON.stringify(data.tilemap, null, 2),
      "utf8",
    );

    res.statusCode = 204;
    res.end();
  });
}
