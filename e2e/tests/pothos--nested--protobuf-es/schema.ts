import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import {
  ParentMessage,
  ParentMessage_NestedEnum,
} from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/nested/nested_pb";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/nested/nested.pb.pothos";
import { builder } from "./builder";

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

printGraphqlSchema({ schema, rootDir: __dirname });
