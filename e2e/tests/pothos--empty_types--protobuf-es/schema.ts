import { EmptyMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/empty_types/empty_pb";

import { EmptyMessage$Ref } from "./__generated__/schema/testapis/empty_types/empty.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: EmptyMessage$Ref,
    resolve() {
      return new EmptyMessage({});
    },
  }),
);

export const schema = builder.toSchema();
