export type Nullable<T> = T | null | undefined;

export interface UnwrapFunc<In, Out> {
  (input: In): Out;
  (input: null | undefined): null;
}
