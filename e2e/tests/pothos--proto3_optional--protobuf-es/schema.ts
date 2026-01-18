import { create } from "@bufbuild/protobuf";
import {
  Message,
  MessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/proto3_optional/proto3_optional_pb";

import { Message$Ref } from "./__generated__/schema/testapis/proto3_optional/proto3_optional.pb.pothos";
import { builder } from "./builder";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return create(MessageSchema, {
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
      return create(MessageSchema, {});
    },
  }),
);

export const schema = builder.toSchema();
