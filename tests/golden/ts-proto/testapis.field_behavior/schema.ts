import { FieldBehaviorComentsMessage } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/field_behavior/comments";

import { FieldBehaviorComentsMessage$Ref } from "./__generated__/testapis/field_behavior/comments.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: FieldBehaviorComentsMessage$Ref,
    resolve() {
      return FieldBehaviorComentsMessage.fromPartial({
        requiredField: { body: "hello" },
      });
    },
  }),
);

export const schema = builder.toSchema();
