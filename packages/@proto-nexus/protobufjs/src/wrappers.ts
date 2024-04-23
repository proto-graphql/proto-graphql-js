import { registerTransformer, type Transformer, stringToNumber } from "proto-nexus";
import type { common } from "protobufjs";

declare global {
  interface ProtoNexusTransformers {
    "google.protobuf.Int32Value": Transformer<common.IInt32Value, number>;
    "google.protobuf.Int64Value": Transformer<common.IInt64Value, string>;
    "google.protobuf.UInt32Value": Transformer<common.IUInt32Value, number>;
    "google.protobuf.UInt64Value": Transformer<common.IUInt64Value, string>;
    "google.protobuf.FloatValue": Transformer<common.IFloatValue, number>;
    "google.protobuf.DoubleValue": Transformer<common.IDoubleValue, number>;
    "google.protobuf.BoolValue": Transformer<common.IBoolValue, boolean>;
    "google.protobuf.StringValue": Transformer<common.IStringValue, string>;
    "google.protobuf.BytesValue": Transformer<common.IBytesValue, Buffer>;
  }
}

registerTransformer("google.protobuf.Int32Value", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.Int64Value", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!.toString();
  },
  gqlToProto(v) {
    return { value: stringToNumber(v) };
  },
});

registerTransformer("google.protobuf.UInt32Value", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.UInt64Value", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!.toString();
  },
  gqlToProto(v) {
    return { value: stringToNumber(v) };
  },
});

registerTransformer("google.protobuf.FloatValue", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.DoubleValue", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.BoolValue", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.StringValue", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return v.value!;
  },
  gqlToProto(v) {
    return { value: v };
  },
});

registerTransformer("google.protobuf.BytesValue", {
  protoToGql(v) {
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    return Buffer.from(v.value!);
  },
  gqlToProto(v) {
    return { value: v };
  },
});
