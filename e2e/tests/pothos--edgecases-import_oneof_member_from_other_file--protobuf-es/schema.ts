import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { OneofParent } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_oneof_member_from_other_file/parent_pb";

import { OneofParent$Ref } from "./__generated__/schema/testapis/edgecases/import_oneof_member_from_other_file/parent.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: OneofParent$Ref,
    resolve() {
      return new OneofParent({
        oneofField: {
          case: "member2",
          value: { count: 15 },
        },
      });
    },
  }),
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
