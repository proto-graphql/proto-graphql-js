import { create } from "@bufbuild/protobuf";
import { ParentMessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/edgecases/import_from_same_pkg/parent_pb";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/parent.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return create(ParentMessageSchema, {
        child: {
          body: "hello",
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
