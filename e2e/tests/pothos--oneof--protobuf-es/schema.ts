import { create } from "@bufbuild/protobuf";
import {
  OneofParent,
  OneofParentSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/oneof/oneof_pb";

import { OneofParent$Ref } from "./__generated__/schema/testapis/oneof/oneof.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: OneofParent$Ref,
    resolve() {
      return create(OneofParentSchema, {
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
