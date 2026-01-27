import { ParentMessage } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/edgecases/import_from_same_pkg/parent";

import { ParentMessage$Ref } from "./__generated__/testapis/edgecases/import_from_same_pkg/parent.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return ParentMessage.fromPartial({
        child: {
          body: "hello",
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
