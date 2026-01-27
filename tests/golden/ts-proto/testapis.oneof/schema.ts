import { OneofParent } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/oneof/oneof";

import { OneofParent$Ref } from "./__generated__/testapis/oneof/oneof.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: OneofParent$Ref,
    resolve() {
      return OneofParent.fromPartial({
        requiredMessage1: {
          body: "hello",
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
