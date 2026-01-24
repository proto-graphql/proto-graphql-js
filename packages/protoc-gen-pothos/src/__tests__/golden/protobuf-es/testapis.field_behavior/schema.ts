import { create } from "@bufbuild/protobuf";
import { FieldBehaviorComentsMessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/field_behavior/comments_pb.js";

import { FieldBehaviorComentsMessage$Ref } from "./__generated__/testapis/field_behavior/comments.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: FieldBehaviorComentsMessage$Ref,
    resolve() {
      return create(FieldBehaviorComentsMessageSchema, {
        requiredField: { body: "hello" },
      });
    },
  }),
);

export const schema = builder.toSchema();
