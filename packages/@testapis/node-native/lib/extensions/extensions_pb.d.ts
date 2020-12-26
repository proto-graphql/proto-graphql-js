// package: testapi.extensions
// file: extensions/extensions.proto

import * as jspb from "google-protobuf";
import * as graphql_schema_pb from "../graphql/schema_pb";

export class PrefixedMessage extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  getPrefixedEnum(): PrefixedEnumMap[keyof PrefixedEnumMap];
  setPrefixedEnum(value: PrefixedEnumMap[keyof PrefixedEnumMap]): void;

  hasIgnoredField(): boolean;
  clearIgnoredField(): void;
  getIgnoredField(): PrefixedMessage.InnerMessage | undefined;
  setIgnoredField(value?: PrefixedMessage.InnerMessage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrefixedMessage.AsObject;
  static toObject(includeInstance: boolean, msg: PrefixedMessage): PrefixedMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrefixedMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrefixedMessage;
  static deserializeBinaryFromReader(message: PrefixedMessage, reader: jspb.BinaryReader): PrefixedMessage;
}

export namespace PrefixedMessage {
  export type AsObject = {
    body: string,
    prefixedEnum: PrefixedEnumMap[keyof PrefixedEnumMap],
    ignoredField?: PrefixedMessage.InnerMessage.AsObject,
  }

  export class InnerMessage extends jspb.Message {
    getBody(): string;
    setBody(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InnerMessage.AsObject;
    static toObject(includeInstance: boolean, msg: InnerMessage): InnerMessage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InnerMessage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InnerMessage;
    static deserializeBinaryFromReader(message: InnerMessage, reader: jspb.BinaryReader): InnerMessage;
  }

  export namespace InnerMessage {
    export type AsObject = {
      body: string,
    }
  }
}

export interface PrefixedEnumMap {
  PREFIXED_ENUM_UNSPECIFIED: 0;
  PREFIXED_FOO: 1;
  PREFIXED_BAR: 2;
}

export const PrefixedEnum: PrefixedEnumMap;

