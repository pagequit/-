export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
  value: string;
};

export function rgba({ r, g, b, a }: Color): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function compileColor(color: Color): void {
  color.value = rgba(color);
}

export function createColor(
  r: number,
  g: number,
  b: number,
  a: number = 1,
): Color {
  const color: Color = { r, g, b, a, value: "" };
  compileColor(color);

  return color;
}
