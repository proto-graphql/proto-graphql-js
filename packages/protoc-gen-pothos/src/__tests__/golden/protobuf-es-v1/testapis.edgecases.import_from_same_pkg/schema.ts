import { ParentMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_from_same_pkg/parent_pb.js";

import { ParentMessage$Ref } from "./__generated__/testapis/edgecases/import_from_same_pkg/parent.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return new ParentMessage({
        child: {
          body: "hello",
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
