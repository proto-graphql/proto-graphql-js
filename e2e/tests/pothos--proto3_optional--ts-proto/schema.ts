import { Message } from "@testapis/ts-proto/lib/testapis/proto3_optional/proto3_optional";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { Message$Ref } from "../__generated__/pothos/ts-proto/testapis/proto3_optional/proto3_optional.pb.pothos";
import { builder } from "./builder";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        requiredStringValue: "required field",
        optionalStringValue: "optional field",
      });
    },
  })
);

builder.queryField("valuesAreBlank", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({});
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
