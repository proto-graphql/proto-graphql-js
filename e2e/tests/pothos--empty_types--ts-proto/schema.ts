import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { EmptyMessage } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/empty_types/empty";
import { EmptyMessage$Ref } from "./__generated__/schema/testapis/empty_types/empty.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: EmptyMessage$Ref,
    resolve() {
      return EmptyMessage.fromPartial({});
    },
  }),
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
