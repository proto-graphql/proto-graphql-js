import { create } from "@bufbuild/protobuf";
import {
  FieldBehaviorComentsMessage,
  FieldBehaviorComentsMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/field_behavior/comments_pb";

import { FieldBehaviorComentsMessage$Ref } from "./__generated__/schema/testapis/field_behavior/comments.pb.pothos";
import { builder } from "./builder";

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
