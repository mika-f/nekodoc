import type { NekoDocConfiguration } from "@nekodoc/plugin-types";

const mergeInto = <T extends { [key: string]: any }, U extends keyof T>(
  a: T,
  b: T
): T => {
  const obj: T = {} as T;

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(a).concat(Object.keys(b))) {
    const value = b[key];

    if (typeof value === "undefined") {
      obj[key as U] = a[key];
    } else if (Array.isArray(value)) {
      // @ts-expect-error
      obj[key as U] = [...(a[key] as unknown[]), ...(b[key] as unknown[])];
    } else if (typeof value === "object") {
      obj[key as U] = mergeInto(a[key], b[key]);
    } else {
      obj[key as U] = value;
    }
  }

  return obj;
};

const merge = (objects: NekoDocConfiguration[]): NekoDocConfiguration => {
  const [first, ...rest] = objects;

  return rest.reduce(
    (previous, current) => mergeInto(previous, current),
    first
  );
};

export default merge;
