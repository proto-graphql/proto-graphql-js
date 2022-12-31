import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { ParentMessage } from "@testapis/ts-proto/lib/testapis/edgecases/import_from_same_pkg/parent";

import { ParentMessage$Ref } from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/parent.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: ParentMessage$Ref,
    resolve() {
      return ParentMessage.fromPartial({
        child: {
          body: "hello",
        },
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
