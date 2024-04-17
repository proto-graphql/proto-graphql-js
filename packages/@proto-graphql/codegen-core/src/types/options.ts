import { ScalarType } from "@bufbuild/protobuf";

export interface TypeOptions {
  partialInputs: boolean;
  /**
   * @defaultValue
   * * Protobuf's 64-bit integer types to `String`
   * * Protobuf's bytes type to `Bytes`
   * * `google.protobuf.Timestamp` to `DateTime`
   *
   * ```
   * {
   *   int32: "Int",
   *   int64: "String",
   *   uint32: "Int",
   *   uint64: "String",
   *   sint32: "Int",
   *   sint64: "String",
   *   fixed32: "Int",
   *   fixed64: "String",
   *   sfixed32: "Int",
   *   sfixed64: "String",
   *   float: "Float",
   *   double: "Float",
   *   string: "String",
   *   bool: "Boolean",
   *   bytes: "Byte",
   *   "google.protobuf.Int32Value": "Int",
   *   "google.protobuf.Int64Value": "String",
   *   "google.protobuf.UInt32Value": "Int",
   *   "google.protobuf.UInt64Value": "String",
   *   "google.protobuf.SInt32Value": "Int",
   *   "google.protobuf.SInt64Value": "String",
   *   "google.protobuf.Fixed32Value": "Int",
   *   "google.protobuf.Fixed64Value": "String",
   *   "google.protobuf.SFixed32Value": "Int",
   *   "google.protobuf.SFixed64Value": "String",
   *   "google.protobuf.FloatValue": "Float",
   *   "google.protobuf.DoubleValue": "Float",
   *   "google.protobuf.StringValue": "String",
   *   "google.protobuf.BoolValue": "Boolean",
   *   "google.protobuf.BytesValue": "Byte",
   *   "google.protobuf.Timestamp": "DateTime",
   * }
   * ```
   * @example Map long numbers to `BigInt` (default: `String`)
   * ```
   * {
   *   "int64": "BigInt",
   *   "uint64": "BigInt",
   *   "sint64": "BigInt",
   *   "fixed64": "BigInt",
   *   "sfixed64": "BigInt",
   *   "google.protobuf.Int64": "BigInt",
   *   "google.protobuf.UInt64": "BigInt",
   *   "google.protobuf.SInt64": "BigInt",
   *   "google.protobuf.Fixed64": "BigInt",
   *   "google.protobuf.SFixed64": "BigInt",
   * }
   * ```
   * @example Map `google.protobuf.Timestamp` to `DateTime`, `google.type.Date` to `Date`
   * ```
   * {
   *   "google.protobuf.Timestamp": "DateTime",
   *   "google.type.Date": "Date",
   * }
   * ```
   */
  scalarMapping: Record<string, string>;
  ignoreNonMessageOneofFields: boolean;
}

const scalarLabelByType: Record<ScalarType, string> = {
  [ScalarType.DOUBLE]: "double",
  [ScalarType.FLOAT]: "float",
  [ScalarType.INT64]: "int64",
  [ScalarType.UINT64]: "uint64",
  [ScalarType.INT32]: "int32",
  [ScalarType.FIXED64]: "fixed64",
  [ScalarType.FIXED32]: "fixed32",
  [ScalarType.BOOL]: "bool",
  [ScalarType.STRING]: "string",
  [ScalarType.BYTES]: "bytes",
  [ScalarType.UINT32]: "uint32",
  [ScalarType.SFIXED32]: "sfixed32",
  [ScalarType.SFIXED64]: "sfixed64",
  [ScalarType.SINT32]: "sint32",
  [ScalarType.SINT64]: "sint64",
};

export const defaultScalarMapping: Readonly<
  Record<
    // eslint-disable-next-line @typescript-eslint/ban-types
    (typeof scalarLabelByType)[ScalarType] | (string & {}),
    string
  >
> = {
  int32: "Int",
  int64: "String",
  uint32: "Int",
  uint64: "String",
  sint32: "Int",
  sint64: "String",
  fixed32: "Int",
  fixed64: "String",
  sfixed32: "Int",
  sfixed64: "String",
  float: "Float",
  double: "Float",
  string: "String",
  bool: "Boolean",
  bytes: "Byte",
  "google.protobuf.Int32Value": "Int",
  "google.protobuf.Int64Value": "String",
  "google.protobuf.UInt32Value": "Int",
  "google.protobuf.UInt64Value": "String",
  "google.protobuf.SInt32Value": "Int",
  "google.protobuf.SInt64Value": "String",
  "google.protobuf.Fixed32Value": "Int",
  "google.protobuf.Fixed64Value": "String",
  "google.protobuf.SFixed32Value": "Int",
  "google.protobuf.SFixed64Value": "String",
  "google.protobuf.FloatValue": "Float",
  "google.protobuf.DoubleValue": "Float",
  "google.protobuf.StringValue": "String",
  "google.protobuf.BoolValue": "Boolean",
  "google.protobuf.BytesValue": "Byte",
  "google.protobuf.Timestamp": "DateTime",
};
