import { create } from "@bufbuild/protobuf";
import {
  ParentMessage_NestedEnum,
  ParentMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/nested/nested_pb";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/nested/nested.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return create(ParentMessageSchema, {
        body: "hello",
        nested: {
          nestedBody: "world",
        },
        nestedEnum: ParentMessage_NestedEnum.BAR,
      });
    },
  }),
);

export const schema = builder.toSchema();
