import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { OneofParent } from "@testapis/ts-proto/lib/testapis/oneof/oneof";

import { OneofParent$Ref } from "./__generated__/schema/testapis/oneof/oneof.pb.pothos";
import { builder } from "./builder";

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
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
