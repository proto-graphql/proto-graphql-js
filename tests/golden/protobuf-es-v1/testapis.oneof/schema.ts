import { OneofParent } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/oneof/oneof_pb.js";

import { OneofParent$Ref } from "./__generated__/testapis/oneof/oneof.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: OneofParent$Ref,
    resolve() {
      return new OneofParent({
        requiredOneofMembers: {
          case: "requiredMessage1",
          value: {
            body: "hello",
          },
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
