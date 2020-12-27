// package: testapis.wktypes
// file: testapis/wktypes/well_known_types.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_wrappers_pb from "google-protobuf/google/protobuf/wrappers_pb";

export class Message extends jspb.Message {
  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasInt32Value(): boolean;
  clearInt32Value(): void;
  getInt32Value(): google_protobuf_wrappers_pb.Int32Value | undefined;
  setInt32Value(value?: google_protobuf_wrappers_pb.Int32Value): void;

  hasInt64Value(): boolean;
  clearInt64Value(): void;
  getInt64Value(): google_protobuf_wrappers_pb.Int64Value | undefined;
  setInt64Value(value?: google_protobuf_wrappers_pb.Int64Value): void;

  hasUint32Value(): boolean;
  clearUint32Value(): void;
  getUint32Value(): google_protobuf_wrappers_pb.UInt32Value | undefined;
  setUint32Value(value?: google_protobuf_wrappers_pb.UInt32Value): void;

  hasUint64Value(): boolean;
  clearUint64Value(): void;
  getUint64Value(): google_protobuf_wrappers_pb.UInt64Value | undefined;
  setUint64Value(value?: google_protobuf_wrappers_pb.UInt64Value): void;

  hasFloatValue(): boolean;
  clearFloatValue(): void;
  getFloatValue(): google_protobuf_wrappers_pb.FloatValue | undefined;
  setFloatValue(value?: google_protobuf_wrappers_pb.FloatValue): void;

  hasDoubleValue(): boolean;
  clearDoubleValue(): void;
  getDoubleValue(): google_protobuf_wrappers_pb.DoubleValue | undefined;
  setDoubleValue(value?: google_protobuf_wrappers_pb.DoubleValue): void;

  hasBoolValue(): boolean;
  clearBoolValue(): void;
  getBoolValue(): google_protobuf_wrappers_pb.BoolValue | undefined;
  setBoolValue(value?: google_protobuf_wrappers_pb.BoolValue): void;

  hasStringValue(): boolean;
  clearStringValue(): void;
  getStringValue(): google_protobuf_wrappers_pb.StringValue | undefined;
  setStringValue(value?: google_protobuf_wrappers_pb.StringValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    int32Value?: google_protobuf_wrappers_pb.Int32Value.AsObject,
    int64Value?: google_protobuf_wrappers_pb.Int64Value.AsObject,
    uint32Value?: google_protobuf_wrappers_pb.UInt32Value.AsObject,
    uint64Value?: google_protobuf_wrappers_pb.UInt64Value.AsObject,
    floatValue?: google_protobuf_wrappers_pb.FloatValue.AsObject,
    doubleValue?: google_protobuf_wrappers_pb.DoubleValue.AsObject,
    boolValue?: google_protobuf_wrappers_pb.BoolValue.AsObject,
    stringValue?: google_protobuf_wrappers_pb.StringValue.AsObject,
  }
}

