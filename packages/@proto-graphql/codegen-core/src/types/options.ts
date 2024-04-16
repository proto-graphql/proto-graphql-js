export interface TypeOptions {
  partialInputs: boolean;
  typeMappings: Record<string, string>;
  /**
   * Which type to map Protobuf's 64-bit integer type to on GraphQL(default: "String").
   * Only Int, String or custom scalars is supported.
   *
   * @remarks
   * Support only protoc-gen-pothos.
   *
   * @remarks
   * If you use ts-proto:
   * - when `longNumber="String"`, you should specify `forceLong=string` for ts-proto
   * - when `longNumber="Int"`, you should specify `forceLong=number` for ts-proto
   */
  longNumber: LongNumberMapping;
  ignoreNonMessageOneofFields: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type LongNumberMapping = "String" | "Int" | (string & {});
