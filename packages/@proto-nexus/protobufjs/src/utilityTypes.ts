export type Nullable<T> = T | null | undefined;

export type Partial<T> = { [K in keyof T]?: Nullable<T[K]> };

export interface UnwrapFunc<In, Out> {
  (input: In): Out;
  (input: null | undefined): null;
}
