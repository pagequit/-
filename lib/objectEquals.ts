/**
 * Compares the own properties of `a` with the coresponding properties of `b`.
 * Returns `true` if there are value wise equal.
 * If `b` is an extension of `a`, the extending properties are ignored.
 * The objects must be transferable for comparison.
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
 */
export function objectEquals(a: object, b: object): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  let truth = true;

  for (const prop in a) {
    // eslint-disable-next-line no-prototype-builtins
    if (!a.hasOwnProperty(prop)) {
      continue;
    }

    // @ts-ignore
    if (typeof a[prop] === "object") {
      // @ts-ignore
      truth = truth && objectEquals(a[prop], b[prop]);
    } else {
      // @ts-ignore
      truth = truth && a[prop] === b[prop];
    }

    if (!truth) {
      break;
    }
  }

  return truth;
}
