 
import {
  ParentMessage,
  ParentMessage_NestedEnum,
} from "@testapis/ts-proto/lib/testapis/nested/nested";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { ParentMessage$Ref } from "../__generated__/pothos/ts-proto/testapis/nested/nested.pb.pothos";
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
