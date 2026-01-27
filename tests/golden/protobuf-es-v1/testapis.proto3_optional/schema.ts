import { Message } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/proto3_optional/proto3_optional_pb.js";

import { Message$Ref } from "./__generated__/testapis/proto3_optional/proto3_optional.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return new Message({
        requiredStringValue: "required field",
        optionalStringValue: "optional field",
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
