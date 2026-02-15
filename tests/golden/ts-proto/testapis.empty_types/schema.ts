import { EmptyMessage } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/empty_types/empty";
import { EmptyMessage$Ref } from "./__generated__/testapis/empty_types/empty.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: EmptyMessage$Ref,
    resolve() {
      return EmptyMessage.fromPartial({});
    },
  }),
);

export const schema = builder.toSchema();
