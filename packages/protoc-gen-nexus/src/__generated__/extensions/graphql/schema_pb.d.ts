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

  export const schema: jspb.ExtensionFieldInfo<GraphqlSchemaOptions>;

