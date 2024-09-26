import { Message } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/proto3_optional/proto3_optional_pb";

import { Message$Ref } from "./__generated__/schema/testapis/proto3_optional/proto3_optional.pb.pothos";
import { builder } from "./builder";

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
