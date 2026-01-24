import { create } from "@bufbuild/protobuf";
import { MessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/edgecases/import_squashed_union/pkg2/types_pb";

import { Message$Ref } from "./__generated__/schema/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return create(MessageSchema, {
        msg: {
          message: {
            case: "msg1",
            value: { body: "hello" },
          },
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
