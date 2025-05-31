export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.error(image.src);
      return resolve(image);
    };

    image.src = src;
  });
}
