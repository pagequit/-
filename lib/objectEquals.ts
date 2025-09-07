/**
 * Compares the own properties of `a` with the corresponding properties of `b`.
 * Returns `true` if there are value wise equal.
 * If `b` is an extension of `a`, the extending properties are ignored.
 * The objects must be transferable for comparison.
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
 */
export function objectEquals<T extends object>(a: T, b: T): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  let truth = true;

  for (const prop in a) {
    if (!Object.hasOwn(a, prop)) {
      continue;
    }

    if (
      a[prop] !== null &&
      b[prop] !== null &&
      typeof a[prop] === "object" &&
      typeof b[prop] === "object"
    ) {
      truth = truth && objectEquals(a[prop], b[prop]);
    } else {
      truth = truth && a[prop] === b[prop];
    }

    if (!truth) {
      break;
    }
  }

  return truth;
}
