import { Message } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/edgecases/import_squashed_union/pkg2/types";

import { Message$Ref } from "./__generated__/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

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
  }),
);

export const schema = builder.toSchema();
