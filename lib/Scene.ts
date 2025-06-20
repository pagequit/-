export type Process = (delta: number) => void;

export type PreProcess = () => void;

export type PostProcess = () => void;

export type SceneData = {
  name: string;
  tileset: string;
};

export type Scene = {
  data: SceneData;
  width: number;
  height: number;
  process: Process;
  preProcess: PreProcess;
  postProcess: PostProcess;
};

export type SceneOptions = {
  data: SceneData;
  width: number;
  height: number;
  process: Process;
  preProcess?: PreProcess;
  postProcess?: PostProcess;
};

export function createScene(options: SceneOptions): Scene {
  return {
    data: options.data,
    width: options.width,
    height: options.height,
    process: options.process,
    preProcess: options.preProcess ?? (() => {}),
    postProcess: options.postProcess ?? (() => {}),
  };
}
