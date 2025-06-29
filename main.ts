import { start } from "#/game/game.ts";

const container = document.getElementById("app") as HTMLElement;
start(container, "testSceneOne").then(() => {
  if (import.meta.env.DEV) {
    import("#/devTools/main.tsx").then((dt) => dt.use(container));
  }
});
