import { FieldBehaviorComentsMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/field_behavior/comments_pb.js";

import { FieldBehaviorComentsMessage$Ref } from "./__generated__/testapis/field_behavior/comments.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: FieldBehaviorComentsMessage$Ref,
    resolve() {
      return new FieldBehaviorComentsMessage({
        requiredField: { body: "hello" },
      });
    },
  }),
);

export const schema = builder.toSchema();
