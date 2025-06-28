import { render, sceneProxy } from "#/game/game.ts";

const container = document.getElementById("app") as HTMLElement;

render(container, "testSceneOne").then(() => {
  if (import.meta.env.DEV) {
    import("#/devTools/main.tsx").then((dt) => dt.use(container, sceneProxy));
  }
});
