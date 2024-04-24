import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { Message } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/edgecases/import_squashed_union/pkg2/types";

import { Message$Ref } from "./__generated__/schema/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos";
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
  }),
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
