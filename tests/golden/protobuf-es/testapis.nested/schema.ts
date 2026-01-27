import { create } from "@bufbuild/protobuf";
import {
  ParentMessage_NestedEnum,
  ParentMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/nested/nested_pb.js";

import { ParentMessage$Ref } from "./__generated__/testapis/nested/nested.pb.pothos.js";
import { builder } from "./builder.js";

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
