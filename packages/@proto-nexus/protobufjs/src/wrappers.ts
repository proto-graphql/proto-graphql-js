import { registerTransformer } from "proto-nexus";
import { common } from "protobufjs";

registerTransformer<common.IInt32Value, number>("google.protobuf.Int32Value", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});

registerTransformer<common.IInt32Value, string>("google.protobuf.Int64Value", {
  protoToGql(v) {
    return v?.value?.toString() ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: parseInt(v) };
  },
});

registerTransformer<common.IUInt32Value, number>("google.protobuf.UInt32Value", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});

registerTransformer<common.IUInt32Value, string>("google.protobuf.UInt64Value", {
  protoToGql(v) {
    return v?.value?.toString() ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: parseInt(v) };
  },
});

registerTransformer<common.IFloatValue, number>("google.protobuf.FloatValue", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});

registerTransformer<common.IDoubleValue, number>("google.protobuf.DoubleValue", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});

registerTransformer<common.IBoolValue, boolean>("google.protobuf.BoolValue", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});

registerTransformer<common.IStringValue, string>("google.protobuf.StringValue", {
  protoToGql(v) {
    return v?.value ?? null;
  },
  gqlToProto(v) {
    if (v == null) return null;
    return { value: v };
  },
});
