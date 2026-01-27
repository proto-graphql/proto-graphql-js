import {
  ParentMessage,
  ParentMessage_NestedEnum,
} from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/nested/nested_pb.js";

import { ParentMessage$Ref } from "./__generated__/testapis/nested/nested.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return new ParentMessage({
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
