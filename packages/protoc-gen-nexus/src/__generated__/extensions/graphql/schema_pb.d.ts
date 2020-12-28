// package: graphql
// file: graphql/schema.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_descriptor_pb from "google-protobuf/google/protobuf/descriptor_pb";

export class GraphqlSchemaOptions extends jspb.Message {
  getTypePrefix(): string;
  setTypePrefix(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlSchemaOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlSchemaOptions): GraphqlSchemaOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlSchemaOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlSchemaOptions;
  static deserializeBinaryFromReader(message: GraphqlSchemaOptions, reader: jspb.BinaryReader): GraphqlSchemaOptions;
}

export namespace GraphqlSchemaOptions {
  export type AsObject = {
    typePrefix: string,
  }
}

export class GraphqlFieldOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlFieldOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlFieldOptions): GraphqlFieldOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlFieldOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlFieldOptions;
  static deserializeBinaryFromReader(message: GraphqlFieldOptions, reader: jspb.BinaryReader): GraphqlFieldOptions;
}

export namespace GraphqlFieldOptions {
  export type AsObject = {
    ignore: boolean,
  }
}

export class GraphqlOneofOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlOneofOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlOneofOptions): GraphqlOneofOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlOneofOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlOneofOptions;
  static deserializeBinaryFromReader(message: GraphqlOneofOptions, reader: jspb.BinaryReader): GraphqlOneofOptions;
}

export namespace GraphqlOneofOptions {
  export type AsObject = {
    ignore: boolean,
  }
}

export class GraphqlEnumValueOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlEnumValueOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlEnumValueOptions): GraphqlEnumValueOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlEnumValueOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlEnumValueOptions;
  static deserializeBinaryFromReader(message: GraphqlEnumValueOptions, reader: jspb.BinaryReader): GraphqlEnumValueOptions;
}

export namespace GraphqlEnumValueOptions {
  export type AsObject = {
    ignore: boolean,
  }
}

  export const schema: jspb.ExtensionFieldInfo<GraphqlSchemaOptions>;

  export const field: jspb.ExtensionFieldInfo<GraphqlFieldOptions>;

  export const oneof: jspb.ExtensionFieldInfo<GraphqlOneofOptions>;

  export const enumValue: jspb.ExtensionFieldInfo<GraphqlEnumValueOptions>;

