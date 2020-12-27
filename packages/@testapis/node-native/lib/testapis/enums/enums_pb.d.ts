// package: testapi.enums
// file: testapis/enums/enums.proto

import * as jspb from "google-protobuf";

export class MessageWithEnums extends jspb.Message {
  getRequiredMyEnum(): MyEnumMap[keyof MyEnumMap];
  setRequiredMyEnum(value: MyEnumMap[keyof MyEnumMap]): void;

  getOptionalMyEnum(): MyEnumMap[keyof MyEnumMap];
  setOptionalMyEnum(value: MyEnumMap[keyof MyEnumMap]): void;

  getRequiredMyEnumWithoutUnspecified(): MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap];
  setRequiredMyEnumWithoutUnspecified(value: MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap]): void;

  getOptionalMyEnumWithoutUnspecified(): MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap];
  setOptionalMyEnumWithoutUnspecified(value: MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap]): void;

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
    requiredMyEnum: MyEnumMap[keyof MyEnumMap],
    optionalMyEnum: MyEnumMap[keyof MyEnumMap],
    requiredMyEnumWithoutUnspecified: MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap],
    optionalMyEnumWithoutUnspecified: MyEnumWithoutUnspecifiedMap[keyof MyEnumWithoutUnspecifiedMap],
  }
}

export interface MyEnumMap {
  MY_ENUM_UNSPECIFIED: 0;
  MY_ENUM_FOO: 1;
  MY_ENUM_BAR: 2;
  MY_ENUM_BAZ: 3;
}

export const MyEnum: MyEnumMap;

export interface MyEnumWithoutUnspecifiedMap {
  MY_ENUM_WITHOUT_UNSPECIFIED_FOO: 0;
  MY_ENUM_WITHOUT_UNSPECIFIED_BAR: 1;
  MY_ENUM_WITHOUT_UNSPECIFIED_BAZ: 2;
}

export const MyEnumWithoutUnspecified: MyEnumWithoutUnspecifiedMap;

