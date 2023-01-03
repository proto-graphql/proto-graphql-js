import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import {
  ParentMessage,
  ParentMessage_NestedEnum,
} from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/nested/nested";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/nested/nested.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return ParentMessage.fromPartial({
        body: "hello",
        nested: {
          nestedBody: "world",
        },
        nestedEnum: ParentMessage_NestedEnum.BAR,
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
