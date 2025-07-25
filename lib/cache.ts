export type Cache<T> = Map<string, T>;
export type AsyncCache<T> = Map<string, Promise<T>>;

export function withCache<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends (...args: any[]) => T,
>(callback: U, key: string, cache: Cache<T>): (...args: Parameters<U>) => T {
  return (...args) => {
    if (cache.has(key)) {
      return cache.get(key) as T;
    }

    const value = callback(...args);
    cache.set(key, value);

    return value;
  };
}

export function withAsyncCache<
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends (...args: any[]) => Promise<T>,
>(
  callback: U,
  key: string,
  cache: AsyncCache<T>,
): (...args: Parameters<U>) => Promise<T> {
  return async (...args) => {
    if (cache.has(key)) {
      return (await cache.get(key)) as T;
    }

    const value = callback(...args);
    cache.set(key, value);

    return await value;
  };
}

export function useWithCache<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => T,
): [(uri: string) => T, Cache<T>] {
  const cache: Cache<T> = new Map();

  return [(uri: string) => withCache(callback, uri, cache)(uri), cache];
}

export function useWithAsyncCache<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => Promise<T>,
): [(uri: string) => Promise<T>, AsyncCache<T>] {
  const cache: AsyncCache<T> = new Map();

  return [(uri: string) => withAsyncCache(callback, uri, cache)(uri), cache];
}
