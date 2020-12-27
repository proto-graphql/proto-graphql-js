// package: testapis.deprecation
// file: testapis/deprecation/deprecation.proto

import * as jspb from "google-protobuf";

export class DeprecatedMessage extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  getEnum(): NotDeprecatedEnumMap[keyof NotDeprecatedEnumMap];
  setEnum(value: NotDeprecatedEnumMap[keyof NotDeprecatedEnumMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeprecatedMessage.AsObject;
  static toObject(includeInstance: boolean, msg: DeprecatedMessage): DeprecatedMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeprecatedMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeprecatedMessage;
  static deserializeBinaryFromReader(message: DeprecatedMessage, reader: jspb.BinaryReader): DeprecatedMessage;
}

export namespace DeprecatedMessage {
  export type AsObject = {
    body: string,
    pb_enum: NotDeprecatedEnumMap[keyof NotDeprecatedEnumMap],
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

export class NotDeprecatedMessage extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  getEnum(): DeprecatedEnumMap[keyof DeprecatedEnumMap];
  setEnum(value: DeprecatedEnumMap[keyof DeprecatedEnumMap]): void;

  hasMsg1(): boolean;
  clearMsg1(): void;
  getMsg1(): NotDeprecatedMessage.InnerMessage1 | undefined;
  setMsg1(value?: NotDeprecatedMessage.InnerMessage1): void;

  hasMsg2(): boolean;
  clearMsg2(): void;
  getMsg2(): NotDeprecatedMessage.InnerMessage2 | undefined;
  setMsg2(value?: NotDeprecatedMessage.InnerMessage2): void;

  hasMsg3(): boolean;
  clearMsg3(): void;
  getMsg3(): NotDeprecatedMessage.InnerMessage1 | undefined;
  setMsg3(value?: NotDeprecatedMessage.InnerMessage1): void;

  hasMsg4(): boolean;
  clearMsg4(): void;
  getMsg4(): NotDeprecatedMessage.InnerMessage2 | undefined;
  setMsg4(value?: NotDeprecatedMessage.InnerMessage2): void;

  getNotDeprecatedOneofCase(): NotDeprecatedMessage.NotDeprecatedOneofCase;
  getDeprecatedOneofCase(): NotDeprecatedMessage.DeprecatedOneofCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotDeprecatedMessage.AsObject;
  static toObject(includeInstance: boolean, msg: NotDeprecatedMessage): NotDeprecatedMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NotDeprecatedMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotDeprecatedMessage;
  static deserializeBinaryFromReader(message: NotDeprecatedMessage, reader: jspb.BinaryReader): NotDeprecatedMessage;
}

export namespace NotDeprecatedMessage {
  export type AsObject = {
    body: string,
    pb_enum: DeprecatedEnumMap[keyof DeprecatedEnumMap],
    msg1?: NotDeprecatedMessage.InnerMessage1.AsObject,
    msg2?: NotDeprecatedMessage.InnerMessage2.AsObject,
    msg3?: NotDeprecatedMessage.InnerMessage1.AsObject,
    msg4?: NotDeprecatedMessage.InnerMessage2.AsObject,
  }

  export class InnerMessage1 extends jspb.Message {
    getBody(): string;
    setBody(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InnerMessage1.AsObject;
    static toObject(includeInstance: boolean, msg: InnerMessage1): InnerMessage1.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InnerMessage1, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InnerMessage1;
    static deserializeBinaryFromReader(message: InnerMessage1, reader: jspb.BinaryReader): InnerMessage1;
  }

  export namespace InnerMessage1 {
    export type AsObject = {
      body: string,
    }
  }

  export class InnerMessage2 extends jspb.Message {
    getBody(): string;
    setBody(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InnerMessage2.AsObject;
    static toObject(includeInstance: boolean, msg: InnerMessage2): InnerMessage2.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InnerMessage2, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InnerMessage2;
    static deserializeBinaryFromReader(message: InnerMessage2, reader: jspb.BinaryReader): InnerMessage2;
  }

  export namespace InnerMessage2 {
    export type AsObject = {
      body: string,
    }
  }

  export enum NotDeprecatedOneofCase {
    NOT_DEPRECATED_ONEOF_NOT_SET = 0,
    MSG1 = 3,
    MSG2 = 4,
  }

  export enum DeprecatedOneofCase {
    DEPRECATED_ONEOF_NOT_SET = 0,
    MSG3 = 5,
    MSG4 = 6,
  }
}

export interface NotDeprecatedEnumMap {
  NOT_DEPRECATED_ENUM_UNSPECIFIED: 0;
  NOT_DEPRECATED_FOO: 1;
  DEPRECATED_BAR: 2;
}

export const NotDeprecatedEnum: NotDeprecatedEnumMap;

export interface DeprecatedEnumMap {
  DEPRECATED_ENUM_UNSPECIFIED: 0;
  DEPRECATED_BAZ: 1;
  DEPRECATED_QUX: 2;
}

export const DeprecatedEnum: DeprecatedEnumMap;

