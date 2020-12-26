// package: testapi.deprecation
// file: deprecation/file_deprecation.proto

import * as jspb from "google-protobuf";

export class DeprecatedFileMessage extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  getEnum(): DeprecatedFileEnumMap[keyof DeprecatedFileEnumMap];
  setEnum(value: DeprecatedFileEnumMap[keyof DeprecatedFileEnumMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeprecatedFileMessage.AsObject;
  static toObject(includeInstance: boolean, msg: DeprecatedFileMessage): DeprecatedFileMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeprecatedFileMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeprecatedFileMessage;
  static deserializeBinaryFromReader(message: DeprecatedFileMessage, reader: jspb.BinaryReader): DeprecatedFileMessage;
}

export namespace DeprecatedFileMessage {
  export type AsObject = {
    body: string,
    pb_enum: DeprecatedFileEnumMap[keyof DeprecatedFileEnumMap],
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

export interface DeprecatedFileEnumMap {
  DEPRECATED_FILE_ENUM_UNSPECIFIED: 0;
  DEPRECATED_FILE_FOO: 1;
  DEPRECATED_FILE_BAR: 2;
}

export const DeprecatedFileEnum: DeprecatedFileEnumMap;

