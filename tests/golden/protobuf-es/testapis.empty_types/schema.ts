import { create } from "@bufbuild/protobuf";
import { EmptyMessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/empty_types/empty_pb.js";

import { EmptyMessage$Ref } from "./__generated__/testapis/empty_types/empty.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: EmptyMessage$Ref,
    resolve() {
      return create(EmptyMessageSchema, {});
    },
  }),
);

export const schema = builder.toSchema();
