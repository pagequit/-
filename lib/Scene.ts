export type Process = (delta: number) => void;

export type Scene = {
  width: number;
  height: number;
  process: Process;
};
