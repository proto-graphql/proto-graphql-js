// package: testapis.hello
// file: testapis/hello/hello.proto

import * as jspb from "google-protobuf";

export class Hello extends jspb.Message {
  hasRequiredPrimitives(): boolean;
  clearRequiredPrimitives(): void;
  getRequiredPrimitives(): Primitives | undefined;
  setRequiredPrimitives(value?: Primitives): void;

  hasOptionalPrimitives(): boolean;
  clearOptionalPrimitives(): void;
  getOptionalPrimitives(): Primitives | undefined;
  setOptionalPrimitives(value?: Primitives): void;

  clearRequiredPrimitivesListList(): void;
  getRequiredPrimitivesListList(): Array<Primitives>;
  setRequiredPrimitivesListList(value: Array<Primitives>): void;
  addRequiredPrimitivesList(value?: Primitives, index?: number): Primitives;

  hasOptionalPrimitivesList(): boolean;
  clearOptionalPrimitivesList(): void;
  getOptionalPrimitivesList(): Primitives | undefined;
  setOptionalPrimitivesList(value?: Primitives): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Hello.AsObject;
  static toObject(includeInstance: boolean, msg: Hello): Hello.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Hello, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Hello;
  static deserializeBinaryFromReader(message: Hello, reader: jspb.BinaryReader): Hello;
}

export namespace Hello {
  export type AsObject = {
    requiredPrimitives?: Primitives.AsObject,
    optionalPrimitives?: Primitives.AsObject,
    requiredPrimitivesListList: Array<Primitives.AsObject>,
    optionalPrimitivesList?: Primitives.AsObject,
  }
}

export class Primitives extends jspb.Message {
  getRequiredDoubleValue(): number;
  setRequiredDoubleValue(value: number): void;

  getRequiredFloatValue(): number;
  setRequiredFloatValue(value: number): void;

  getRequiredInt32Value(): number;
  setRequiredInt32Value(value: number): void;

  getRequiredInt64Value(): number;
  setRequiredInt64Value(value: number): void;

  getRequiredUint32Value(): number;
  setRequiredUint32Value(value: number): void;

  getRequiredUint64Value(): number;
  setRequiredUint64Value(value: number): void;

  getRequiredSint32Value(): number;
  setRequiredSint32Value(value: number): void;

  getRequiredSint64Value(): number;
  setRequiredSint64Value(value: number): void;

  getRequiredFixed32Value(): number;
  setRequiredFixed32Value(value: number): void;

  getRequiredFixed64Value(): number;
  setRequiredFixed64Value(value: number): void;

  getRequiredSfixed32Value(): number;
  setRequiredSfixed32Value(value: number): void;

  getRequiredSfixed64Value(): number;
  setRequiredSfixed64Value(value: number): void;

  getRequiredBoolValue(): boolean;
  setRequiredBoolValue(value: boolean): void;

  getRequiredStringValue(): string;
  setRequiredStringValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Primitives.AsObject;
  static toObject(includeInstance: boolean, msg: Primitives): Primitives.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Primitives, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Primitives;
  static deserializeBinaryFromReader(message: Primitives, reader: jspb.BinaryReader): Primitives;
}

export namespace Primitives {
  export type AsObject = {
    requiredDoubleValue: number,
    requiredFloatValue: number,
    requiredInt32Value: number,
    requiredInt64Value: number,
    requiredUint32Value: number,
    requiredUint64Value: number,
    requiredSint32Value: number,
    requiredSint64Value: number,
    requiredFixed32Value: number,
    requiredFixed64Value: number,
    requiredSfixed32Value: number,
    requiredSfixed64Value: number,
    requiredBoolValue: boolean,
    requiredStringValue: string,
  }
}

