// package: testapi.nested
// file: nested/nested.proto

import * as jspb from "google-protobuf";

export class ParentMessage extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  hasNested(): boolean;
  clearNested(): void;
  getNested(): ParentMessage.NestedMessage | undefined;
  setNested(value?: ParentMessage.NestedMessage): void;

  getNestedEnum(): ParentMessage.NestedEnumMap[keyof ParentMessage.NestedEnumMap];
  setNestedEnum(value: ParentMessage.NestedEnumMap[keyof ParentMessage.NestedEnumMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParentMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ParentMessage): ParentMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParentMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParentMessage;
  static deserializeBinaryFromReader(message: ParentMessage, reader: jspb.BinaryReader): ParentMessage;
}

export namespace ParentMessage {
  export type AsObject = {
    body: string,
    nested?: ParentMessage.NestedMessage.AsObject,
    nestedEnum: ParentMessage.NestedEnumMap[keyof ParentMessage.NestedEnumMap],
  }

  export class NestedMessage extends jspb.Message {
    getNestedBody(): string;
    setNestedBody(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NestedMessage.AsObject;
    static toObject(includeInstance: boolean, msg: NestedMessage): NestedMessage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NestedMessage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NestedMessage;
    static deserializeBinaryFromReader(message: NestedMessage, reader: jspb.BinaryReader): NestedMessage;
  }

  export namespace NestedMessage {
    export type AsObject = {
      nestedBody: string,
    }
  }

  export interface NestedEnumMap {
    NESTED_ENUM_UNSPECIFIED: 0;
    FOO: 1;
    BAR: 2;
  }

  export const NestedEnum: NestedEnumMap;
}

