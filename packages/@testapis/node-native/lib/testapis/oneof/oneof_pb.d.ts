// package: testapis.oneof
// file: testapis/oneof/oneof.proto

import * as jspb from "google-protobuf";

export class OneofParent extends jspb.Message {
  getNormalField(): string;
  setNormalField(value: string): void;

  hasRequiredMessage1(): boolean;
  clearRequiredMessage1(): void;
  getRequiredMessage1(): OneofMemberMessage1 | undefined;
  setRequiredMessage1(value?: OneofMemberMessage1): void;

  hasRequiredMessage2(): boolean;
  clearRequiredMessage2(): void;
  getRequiredMessage2(): OneofMemberMessage2 | undefined;
  setRequiredMessage2(value?: OneofMemberMessage2): void;

  hasOptoinalMessage1(): boolean;
  clearOptoinalMessage1(): void;
  getOptoinalMessage1(): OneofMemberMessage1 | undefined;
  setOptoinalMessage1(value?: OneofMemberMessage1): void;

  hasOptoinalMessage2(): boolean;
  clearOptoinalMessage2(): void;
  getOptoinalMessage2(): OneofMemberMessage2 | undefined;
  setOptoinalMessage2(value?: OneofMemberMessage2): void;

  getRequiredOneofMembersCase(): OneofParent.RequiredOneofMembersCase;
  getOptionalOneofMembersCase(): OneofParent.OptionalOneofMembersCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OneofParent.AsObject;
  static toObject(includeInstance: boolean, msg: OneofParent): OneofParent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OneofParent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OneofParent;
  static deserializeBinaryFromReader(message: OneofParent, reader: jspb.BinaryReader): OneofParent;
}

export namespace OneofParent {
  export type AsObject = {
    normalField: string,
    requiredMessage1?: OneofMemberMessage1.AsObject,
    requiredMessage2?: OneofMemberMessage2.AsObject,
    optoinalMessage1?: OneofMemberMessage1.AsObject,
    optoinalMessage2?: OneofMemberMessage2.AsObject,
  }

  export enum RequiredOneofMembersCase {
    REQUIRED_ONEOF_MEMBERS_NOT_SET = 0,
    REQUIRED_MESSAGE1 = 2,
    REQUIRED_MESSAGE2 = 3,
  }

  export enum OptionalOneofMembersCase {
    OPTIONAL_ONEOF_MEMBERS_NOT_SET = 0,
    OPTOINAL_MESSAGE1 = 4,
    OPTOINAL_MESSAGE2 = 5,
  }
}

export class OneofMemberMessage1 extends jspb.Message {
  getBody(): string;
  setBody(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OneofMemberMessage1.AsObject;
  static toObject(includeInstance: boolean, msg: OneofMemberMessage1): OneofMemberMessage1.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OneofMemberMessage1, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OneofMemberMessage1;
  static deserializeBinaryFromReader(message: OneofMemberMessage1, reader: jspb.BinaryReader): OneofMemberMessage1;
}

export namespace OneofMemberMessage1 {
  export type AsObject = {
    body: string,
  }
}

export class OneofMemberMessage2 extends jspb.Message {
  getImageUrl(): string;
  setImageUrl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OneofMemberMessage2.AsObject;
  static toObject(includeInstance: boolean, msg: OneofMemberMessage2): OneofMemberMessage2.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OneofMemberMessage2, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OneofMemberMessage2;
  static deserializeBinaryFromReader(message: OneofMemberMessage2, reader: jspb.BinaryReader): OneofMemberMessage2;
}

export namespace OneofMemberMessage2 {
  export type AsObject = {
    imageUrl: string,
  }
}

