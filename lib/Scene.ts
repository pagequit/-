import { type Node } from "./Graph";

export type Process = (delta: number) => void;

export type PreProcess = () => void;

export type PostProcess = () => void;

export type SceneNode = Node<{ name: string }>;

export type Scene = {
  width: number;
  height: number;
  process: Process;
  preProcess: PreProcess;
  postProcess: PostProcess;
};

export type SceneOptions = {
  width: number;
  height: number;
  process: Process;
  preProcess?: PreProcess;
  postProcess?: PostProcess;
};

export function createScene(options: SceneOptions): Scene {
  return {
    width: options.width,
    height: options.height,
    process: options.process,
    preProcess: options.preProcess ?? (() => {}),
    postProcess: options.postProcess ?? (() => {}),
  };
}
