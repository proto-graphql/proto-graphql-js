import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { FieldBehaviorComentsMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/field_behavior/comments_pb";

import { FieldBehaviorComentsMessage$Ref } from "./__generated__/schema/testapis/field_behavior/comments.pb.pothos";
import { builder } from "./builder";

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

printGraphqlSchema({ schema, rootDir: __dirname });
