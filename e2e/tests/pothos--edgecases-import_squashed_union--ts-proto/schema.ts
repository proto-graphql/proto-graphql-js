import { Message } from "@testapis/ts-proto/lib/testapis/edgecases/import_squashed_union/pkg2/types";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { Message$Ref } from "../__generated__/pothos/ts-proto/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        msg: {
          msg1: { body: "hello" },
        },
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
