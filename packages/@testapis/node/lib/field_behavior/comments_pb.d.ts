// package: testapi.deprecation
// file: field_behavior/comments.proto

import * as jspb from "google-protobuf";

export class FieldBehaviorComentsMessage extends jspb.Message {
  hasRequiredField(): boolean;
  clearRequiredField(): void;
  getRequiredField(): FieldBehaviorComentsMessage.Post | undefined;
  setRequiredField(value?: FieldBehaviorComentsMessage.Post): void;

  hasRequiredOutputOnlyField(): boolean;
  clearRequiredOutputOnlyField(): void;
  getRequiredOutputOnlyField(): FieldBehaviorComentsMessage.Post | undefined;
  setRequiredOutputOnlyField(value?: FieldBehaviorComentsMessage.Post): void;

  hasOutputOnlyRequiredField(): boolean;
  clearOutputOnlyRequiredField(): void;
  getOutputOnlyRequiredField(): FieldBehaviorComentsMessage.Post | undefined;
  setOutputOnlyRequiredField(value?: FieldBehaviorComentsMessage.Post): void;

  hasOutputOnlyField(): boolean;
  clearOutputOnlyField(): void;
  getOutputOnlyField(): FieldBehaviorComentsMessage.Post | undefined;
  setOutputOnlyField(value?: FieldBehaviorComentsMessage.Post): void;

  hasRequiredInputOnlyField(): boolean;
  clearRequiredInputOnlyField(): void;
  getRequiredInputOnlyField(): FieldBehaviorComentsMessage.Post | undefined;
  setRequiredInputOnlyField(value?: FieldBehaviorComentsMessage.Post): void;

  hasInputOnlyRequiredField(): boolean;
  clearInputOnlyRequiredField(): void;
  getInputOnlyRequiredField(): FieldBehaviorComentsMessage.Post | undefined;
  setInputOnlyRequiredField(value?: FieldBehaviorComentsMessage.Post): void;

  hasInputOnlyField(): boolean;
  clearInputOnlyField(): void;
  getInputOnlyField(): FieldBehaviorComentsMessage.Post | undefined;
  setInputOnlyField(value?: FieldBehaviorComentsMessage.Post): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FieldBehaviorComentsMessage.AsObject;
  static toObject(includeInstance: boolean, msg: FieldBehaviorComentsMessage): FieldBehaviorComentsMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FieldBehaviorComentsMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FieldBehaviorComentsMessage;
  static deserializeBinaryFromReader(message: FieldBehaviorComentsMessage, reader: jspb.BinaryReader): FieldBehaviorComentsMessage;
}

export namespace FieldBehaviorComentsMessage {
  export type AsObject = {
    requiredField?: FieldBehaviorComentsMessage.Post.AsObject,
    requiredOutputOnlyField?: FieldBehaviorComentsMessage.Post.AsObject,
    outputOnlyRequiredField?: FieldBehaviorComentsMessage.Post.AsObject,
    outputOnlyField?: FieldBehaviorComentsMessage.Post.AsObject,
    requiredInputOnlyField?: FieldBehaviorComentsMessage.Post.AsObject,
    inputOnlyRequiredField?: FieldBehaviorComentsMessage.Post.AsObject,
    inputOnlyField?: FieldBehaviorComentsMessage.Post.AsObject,
  }

  export class Post extends jspb.Message {
    getBody(): string;
    setBody(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Post.AsObject;
    static toObject(includeInstance: boolean, msg: Post): Post.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Post, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Post;
    static deserializeBinaryFromReader(message: Post, reader: jspb.BinaryReader): Post;
  }

  export namespace Post {
    export type AsObject = {
      body: string,
    }
  }
}

