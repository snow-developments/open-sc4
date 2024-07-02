export type Constructor = { new(...args: readonly unknown[]): unknown }
export type AnyFn = (...args: unknown[]) => unknown

/**
 * Omit everything except instance properties of the given constructor, `C`.
 * @see [How to get all the properties (but not methods) from a class instance?](https://stackoverflow.com/a/74321141/1363247) (StackOverflow)
 **/
export type PropertiesOf<C extends Constructor> = {
  [K in keyof InstanceType<C> as InstanceType<C>[K] extends AnyFn ? never : K]: InstanceType<C>[K]
}

/**
 * Omit everything except instance properties of the given object, `T`.
 * @see [How to get all the properties (but not methods) from a class instance?](https://stackoverflow.com/a/74321141/1363247) (StackOverflow)
 **/
export type OmitFunctions<T extends object> = {
  [K in keyof T as T[K] extends AnyFn ? never : K]: T[K]
}
