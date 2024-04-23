// @generated by protoc-gen-es v1.8.0 with parameter "target=ts"
// @generated from file graphql/schema.proto (package graphql, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { EnumOptions, EnumValueOptions, FieldOptions, FileOptions, Message, MessageOptions, OneofOptions, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum graphql.Nullability
 */
export enum Nullability {
  /**
   * @generated from enum value: NULLABILITY_UNSPECIFIED = 0;
   */
  NULLABILITY_UNSPECIFIED = 0,

  /**
   * @generated from enum value: NULLABLE = 1;
   */
  NULLABLE = 1,

  /**
   * @generated from enum value: NON_NULL = 2;
   */
  NON_NULL = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(Nullability)
proto3.util.setEnumType(Nullability, "graphql.Nullability", [
  { no: 0, name: "NULLABILITY_UNSPECIFIED" },
  { no: 1, name: "NULLABLE" },
  { no: 2, name: "NON_NULL" },
]);

/**
 * @generated from message graphql.GraphqlSchemaOptions
 */
export class GraphqlSchemaOptions extends Message<GraphqlSchemaOptions> {
  /**
   * @generated from field: string type_prefix = 1;
   */
  typePrefix = "";

  /**
   * @generated from field: bool ignore_requests = 2;
   */
  ignoreRequests = false;

  /**
   * @generated from field: bool ignore_responses = 3;
   */
  ignoreResponses = false;

  /**
   * @generated from field: bool ignore = 4;
   */
  ignore = false;

  constructor(data?: PartialMessage<GraphqlSchemaOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlSchemaOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "type_prefix", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "ignore_requests", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 3, name: "ignore_responses", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlSchemaOptions {
    return new GraphqlSchemaOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlSchemaOptions {
    return new GraphqlSchemaOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlSchemaOptions {
    return new GraphqlSchemaOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlSchemaOptions | PlainMessage<GraphqlSchemaOptions> | undefined, b: GraphqlSchemaOptions | PlainMessage<GraphqlSchemaOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlSchemaOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlObjectTypeOptions
 */
export class GraphqlObjectTypeOptions extends Message<GraphqlObjectTypeOptions> {
  /**
   * Do not generate GraphQL Object and Input. Nested types will not be ignored.
   *
   * @generated from field: bool ignore = 1;
   */
  ignore = false;

  /**
   * If `squash_union` is true, the message is converted to `union` instead of object type.
   *
   * ```proto
   * message Content {
   *   option (graphql.object_type).squash_union = true;
   *   oneof content {
   *     Blog blog = 2;
   *     Video video = 2;
   *   }
   * }
   * ```
   *
   * ```grahpql
   * union Content = Blog | Video
   * ```
   *
   * @generated from field: bool squash_union = 2;
   */
  squashUnion = false;

  /**
   * If `interface` is true, the message is converted to `interface` instead of object type.
   *
   * @generated from field: bool interface = 3;
   */
  interface = false;

  /**
   * Specify a object name in GraphQL. If do not specified, use the same as a Protobuf message field name.
   *
   * ```proto
   * message Foo {
   *   option (graphql.object_type).name = "Bar"
   *   // ...
   * }
   * ````
   *
   * ```grahpql
   * object Bar {
   *   # ...
   * }
   * ```
   *
   * @generated from field: string name = 4;
   */
  name = "";

  constructor(data?: PartialMessage<GraphqlObjectTypeOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlObjectTypeOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: "squash_union", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 3, name: "interface", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlObjectTypeOptions {
    return new GraphqlObjectTypeOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlObjectTypeOptions {
    return new GraphqlObjectTypeOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlObjectTypeOptions {
    return new GraphqlObjectTypeOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlObjectTypeOptions | PlainMessage<GraphqlObjectTypeOptions> | undefined, b: GraphqlObjectTypeOptions | PlainMessage<GraphqlObjectTypeOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlObjectTypeOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlInputTypeOptions
 */
export class GraphqlInputTypeOptions extends Message<GraphqlInputTypeOptions> {
  /**
   * Do not always generate partial input types.
   *
   * @generated from field: bool no_partial = 1;
   */
  noPartial = false;

  /**
   * Do not generate GraphQL Input. Nested types will not be ignored.
   *
   * @generated from field: bool ignore = 2;
   */
  ignore = false;

  constructor(data?: PartialMessage<GraphqlInputTypeOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlInputTypeOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "no_partial", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlInputTypeOptions {
    return new GraphqlInputTypeOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlInputTypeOptions {
    return new GraphqlInputTypeOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlInputTypeOptions {
    return new GraphqlInputTypeOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlInputTypeOptions | PlainMessage<GraphqlInputTypeOptions> | undefined, b: GraphqlInputTypeOptions | PlainMessage<GraphqlInputTypeOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlInputTypeOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlFieldOptions
 */
export class GraphqlFieldOptions extends Message<GraphqlFieldOptions> {
  /**
   * @generated from field: bool ignore = 1;
   */
  ignore = false;

  /**
   * Specify a field name in GraphQL. If do not specified, use the same as a Protobuf message field name.
   *
   * ```proto
   * message User {
   *   // Required. Output only.
   *   uint64 id = 1 [(graphql.field).name = "databaseId"];
   * }
   * ````
   *
   * ```grahpql
   * object User {
   *   databaseId: String!
   * }
   * ```
   *
   * @generated from field: string name = 2;
   */
  name = "";

  /**
   * Omit resolver implementation in code generation.
   *
   * @generated from field: bool skip_resolver = 3;
   */
  skipResolver = false;

  /**
   * Use ID type.
   *
   * ```proto
   * message User {
   *   // Required. Output only.
   *   uint64 id = 1 [(graphql.field).id = true];
   * }
   * ````
   *
   * ```grahpql
   * object User {
   *   id: ID!
   * }
   * ```
   *
   * @generated from field: bool id = 4;
   */
  id = false;

  /**
   * Indicates the nullability of the output for a given field.
   *
   * @generated from field: graphql.Nullability output_nullability = 11;
   */
  outputNullability = Nullability.NULLABILITY_UNSPECIFIED;

  /**
   * Indicates the nullability of the input for a given field.
   *
   * @generated from field: graphql.Nullability input_nullability = 12;
   */
  inputNullability = Nullability.NULLABILITY_UNSPECIFIED;

  /**
   * Indicates the nullability of the partial input for a given field.
   *
   * @generated from field: graphql.Nullability partial_input_nullability = 13;
   */
  partialInputNullability = Nullability.NULLABILITY_UNSPECIFIED;

  constructor(data?: PartialMessage<GraphqlFieldOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlFieldOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 2, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "skip_resolver", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "id", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 11, name: "output_nullability", kind: "enum", T: proto3.getEnumType(Nullability) },
    { no: 12, name: "input_nullability", kind: "enum", T: proto3.getEnumType(Nullability) },
    { no: 13, name: "partial_input_nullability", kind: "enum", T: proto3.getEnumType(Nullability) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlFieldOptions {
    return new GraphqlFieldOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlFieldOptions {
    return new GraphqlFieldOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlFieldOptions {
    return new GraphqlFieldOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlFieldOptions | PlainMessage<GraphqlFieldOptions> | undefined, b: GraphqlFieldOptions | PlainMessage<GraphqlFieldOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlFieldOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlOneofOptions
 */
export class GraphqlOneofOptions extends Message<GraphqlOneofOptions> {
  /**
   * @generated from field: bool ignore = 1;
   */
  ignore = false;

  constructor(data?: PartialMessage<GraphqlOneofOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlOneofOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlOneofOptions {
    return new GraphqlOneofOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlOneofOptions {
    return new GraphqlOneofOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlOneofOptions {
    return new GraphqlOneofOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlOneofOptions | PlainMessage<GraphqlOneofOptions> | undefined, b: GraphqlOneofOptions | PlainMessage<GraphqlOneofOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlOneofOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlEnumOptions
 */
export class GraphqlEnumOptions extends Message<GraphqlEnumOptions> {
  /**
   * @generated from field: bool ignore = 1;
   */
  ignore = false;

  /**
   * Specify an enum name in GraphQL. If do not specified, use the same as a Protobuf message field name.
   *
   * ```proto
   * enum Foo {
   *   option (graphql.enum_type).name = "Bar"
   *   // ...
   * }
   * ````
   *
   * ```grahpql
   * enum Bar {
   *   # ...
   * }
   * ```
   *
   * @generated from field: string name = 4;
   */
  name = "";

  constructor(data?: PartialMessage<GraphqlEnumOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlEnumOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlEnumOptions {
    return new GraphqlEnumOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlEnumOptions {
    return new GraphqlEnumOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlEnumOptions {
    return new GraphqlEnumOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlEnumOptions | PlainMessage<GraphqlEnumOptions> | undefined, b: GraphqlEnumOptions | PlainMessage<GraphqlEnumOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlEnumOptions, a, b);
  }
}

/**
 * @generated from message graphql.GraphqlEnumValueOptions
 */
export class GraphqlEnumValueOptions extends Message<GraphqlEnumValueOptions> {
  /**
   * @generated from field: bool ignore = 1;
   */
  ignore = false;

  constructor(data?: PartialMessage<GraphqlEnumValueOptions>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "graphql.GraphqlEnumValueOptions";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "ignore", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GraphqlEnumValueOptions {
    return new GraphqlEnumValueOptions().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GraphqlEnumValueOptions {
    return new GraphqlEnumValueOptions().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GraphqlEnumValueOptions {
    return new GraphqlEnumValueOptions().fromJsonString(jsonString, options);
  }

  static equals(a: GraphqlEnumValueOptions | PlainMessage<GraphqlEnumValueOptions> | undefined, b: GraphqlEnumValueOptions | PlainMessage<GraphqlEnumValueOptions> | undefined): boolean {
    return proto3.util.equals(GraphqlEnumValueOptions, a, b);
  }
}

/**
 * @generated from extension: graphql.GraphqlSchemaOptions schema = 2056;
 */
export const schema = proto3.makeExtension<FileOptions, GraphqlSchemaOptions>(
  "graphql.schema", 
  FileOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlSchemaOptions }),
);

/**
 * @generated from extension: graphql.GraphqlObjectTypeOptions object_type = 2056;
 */
export const object_type = proto3.makeExtension<MessageOptions, GraphqlObjectTypeOptions>(
  "graphql.object_type", 
  MessageOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlObjectTypeOptions }),
);

/**
 * @generated from extension: graphql.GraphqlInputTypeOptions input_type = 2057;
 */
export const input_type = proto3.makeExtension<MessageOptions, GraphqlInputTypeOptions>(
  "graphql.input_type", 
  MessageOptions, 
  () => ({ no: 2057, kind: "message", T: GraphqlInputTypeOptions }),
);

/**
 * @generated from extension: graphql.GraphqlFieldOptions field = 2056;
 */
export const field = proto3.makeExtension<FieldOptions, GraphqlFieldOptions>(
  "graphql.field", 
  FieldOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlFieldOptions }),
);

/**
 * @generated from extension: graphql.GraphqlOneofOptions oneof = 2056;
 */
export const oneof = proto3.makeExtension<OneofOptions, GraphqlOneofOptions>(
  "graphql.oneof", 
  OneofOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlOneofOptions }),
);

/**
 * @generated from extension: graphql.GraphqlEnumOptions enum_type = 2056;
 */
export const enum_type = proto3.makeExtension<EnumOptions, GraphqlEnumOptions>(
  "graphql.enum_type", 
  EnumOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlEnumOptions }),
);

/**
 * @generated from extension: graphql.GraphqlEnumValueOptions enum_value = 2056;
 */
export const enum_value = proto3.makeExtension<EnumValueOptions, GraphqlEnumValueOptions>(
  "graphql.enum_value", 
  EnumValueOptions, 
  () => ({ no: 2056, kind: "message", T: GraphqlEnumValueOptions }),
);

