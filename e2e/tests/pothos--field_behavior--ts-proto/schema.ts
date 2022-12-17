import { FieldBehaviorComentsMessage } from "@testapis/ts-proto/lib/testapis/field_behavior/comments";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { FieldBehaviorComentsMessage$Ref } from "../__generated__/pothos/ts-proto/testapis/field_behavior/comments.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: FieldBehaviorComentsMessage$Ref,
    resolve() {
      return FieldBehaviorComentsMessage.fromPartial({
        requiredField: { body: "hello" },
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
