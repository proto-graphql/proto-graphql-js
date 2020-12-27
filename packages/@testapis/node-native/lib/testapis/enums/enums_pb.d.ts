// package: testapi.enums
// file: testapis/enums/enums.proto

import * as jspb from "google-protobuf";

export class MessageWithEnums extends jspb.Message {
  getMyEnum1(): MyEnum1Map[keyof MyEnum1Map];
  setMyEnum1(value: MyEnum1Map[keyof MyEnum1Map]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageWithEnums.AsObject;
  static toObject(includeInstance: boolean, msg: MessageWithEnums): MessageWithEnums.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageWithEnums, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageWithEnums;
  static deserializeBinaryFromReader(message: MessageWithEnums, reader: jspb.BinaryReader): MessageWithEnums;
}

export namespace MessageWithEnums {
  export type AsObject = {
    myEnum1: MyEnum1Map[keyof MyEnum1Map],
  }
}

export interface MyEnum1Map {
  MY_ENUM_1_UNSPECIRED: 0;
  FOO: 1;
  BAR: 2;
  BAZ: 3;
}

export const MyEnum1: MyEnum1Map;

