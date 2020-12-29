// package: graphql
// file: graphql/schema.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_descriptor_pb from "google-protobuf/google/protobuf/descriptor_pb";

export class GraphqlSchemaOptions extends jspb.Message {
  getTypePrefix(): string;
  setTypePrefix(value: string): void;

  getIgnoreRequests(): boolean;
  setIgnoreRequests(value: boolean): void;

  getIgnoreResponses(): boolean;
  setIgnoreResponses(value: boolean): void;

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
    ignoreRequests: boolean,
    ignoreResponses: boolean,
  }
}

export class GraphqlObjectTypeOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  getSquashUnion(): boolean;
  setSquashUnion(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlObjectTypeOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlObjectTypeOptions): GraphqlObjectTypeOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlObjectTypeOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlObjectTypeOptions;
  static deserializeBinaryFromReader(message: GraphqlObjectTypeOptions, reader: jspb.BinaryReader): GraphqlObjectTypeOptions;
}

export namespace GraphqlObjectTypeOptions {
  export type AsObject = {
    ignore: boolean,
    squashUnion: boolean,
  }
}

export class GraphqlInputObjectTypeOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlInputObjectTypeOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlInputObjectTypeOptions): GraphqlInputObjectTypeOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlInputObjectTypeOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlInputObjectTypeOptions;
  static deserializeBinaryFromReader(message: GraphqlInputObjectTypeOptions, reader: jspb.BinaryReader): GraphqlInputObjectTypeOptions;
}

export namespace GraphqlInputObjectTypeOptions {
  export type AsObject = {
    ignore: boolean,
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

export class GraphqlEnumOptions extends jspb.Message {
  getIgnore(): boolean;
  setIgnore(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphqlEnumOptions.AsObject;
  static toObject(includeInstance: boolean, msg: GraphqlEnumOptions): GraphqlEnumOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphqlEnumOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphqlEnumOptions;
  static deserializeBinaryFromReader(message: GraphqlEnumOptions, reader: jspb.BinaryReader): GraphqlEnumOptions;
}

export namespace GraphqlEnumOptions {
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

  export const objectType: jspb.ExtensionFieldInfo<GraphqlObjectTypeOptions>;

  export const inputType: jspb.ExtensionFieldInfo<GraphqlInputObjectTypeOptions>;

  export const field: jspb.ExtensionFieldInfo<GraphqlFieldOptions>;

  export const oneof: jspb.ExtensionFieldInfo<GraphqlOneofOptions>;

  export const enumType: jspb.ExtensionFieldInfo<GraphqlEnumOptions>;

  export const enumValue: jspb.ExtensionFieldInfo<GraphqlEnumValueOptions>;

