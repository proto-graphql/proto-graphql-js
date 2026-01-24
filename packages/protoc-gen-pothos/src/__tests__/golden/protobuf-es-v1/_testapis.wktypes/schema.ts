import { Message } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/wktypes/well_known_types_pb.js";
import { Message$Ref } from "./__generated__/testapis/wktypes/well_known_types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      const date = new Date(1609137725453);
      return Message.fromJson({
        timestamp: date.toISOString(),
        int32Value: 2,
        int64Value: "4",
        uint32Value: 5,
        uint64Value: "6",
        floatValue: 3.5,
        doubleValue: 2.4,
        boolValue: true,
        stringValue: "foobar",
      });
    },
  }),
);

builder.queryField("valuesAreBlank", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return new Message({});
    },
  }),
);

export const schema = builder.toSchema();
