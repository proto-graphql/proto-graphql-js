import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { ChildMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_from_same_pkg/child_pb";
import { ParentMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_from_same_pkg/parent_pb";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/parent.pb.pothos";
import { builder } from "./builder";

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

printGraphqlSchema({ schema, rootDir: __dirname });
