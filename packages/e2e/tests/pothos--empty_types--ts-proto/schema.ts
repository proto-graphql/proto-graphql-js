import { EmptyMessage } from "@testapis/ts-proto/lib/testapis/empty_types/empty";
import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { EmptyMessage$Ref } from "../__generated__/pothos/ts-proto/testapis/empty_types/empty.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: EmptyMessage$Ref,
    resolve() {
      return EmptyMessage.fromPartial({});
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
