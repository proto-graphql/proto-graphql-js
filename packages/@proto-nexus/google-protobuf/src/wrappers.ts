import * as wrappersPb from "google-protobuf/google/protobuf/wrappers_pb";
import { registerTransformer } from "proto-nexus";

registerTransformer<wrappersPb.Int32Value, number>("google.protobuf.Int32Value", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.Int32Value().setValue(v);
  },
});

registerTransformer<wrappersPb.Int64Value, string>("google.protobuf.Int64Value", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue().toString();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.Int64Value().setValue(parseInt(v));
  },
});

registerTransformer<wrappersPb.UInt32Value, number>("google.protobuf.UInt32Value", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.UInt32Value().setValue(v);
  },
});

registerTransformer<wrappersPb.UInt64Value, string>("google.protobuf.UInt64Value", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue().toString();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.UInt64Value().setValue(parseInt(v));
  },
});

registerTransformer<wrappersPb.FloatValue, number>("google.protobuf.FloatValue", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.FloatValue().setValue(v);
  },
});

registerTransformer<wrappersPb.DoubleValue, number>("google.protobuf.DoubleValue", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.DoubleValue().setValue(v);
  },
});

registerTransformer<wrappersPb.BoolValue, boolean>("google.protobuf.BoolValue", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.BoolValue().setValue(v);
  },
});

registerTransformer<wrappersPb.StringValue, string>("google.protobuf.StringValue", {
  protoToGql(v) {
    if (v == null) return null;
    return v.getValue();
  },
  gqlToProto(v) {
    if (v == null) return null;
    return new wrappersPb.StringValue().setValue(v);
  },
});
