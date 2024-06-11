import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { PrefixedMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/extensions/extensions_pb";

import {
  TestPrefixInterfaceMessage$Ref,
  TestPrefixPrefixedMessage$Ref,
  TestPrefixPrefixedMessageInnerMessage$Ref,
} from "./__generated__/schema/testapis/extensions/extensions.pb.pothos";
import { builder } from "./builder";

builder.queryField("testSquashedUnion", (t) =>
  t.field({
    type: TestPrefixPrefixedMessage$Ref,
    resolve() {
      return new PrefixedMessage({
        squashedMessage: {
          squashedMessage: {
            case: "oneofField2",
            value: {
              body: "field 2",
            },
          },
        },
      });
    },
  }),
);

const ImplObject$Ref = builder.objectRef<{
  id: bigint;
  body: string;
  $type: "ImplObject";
}>("ImplObject");
builder.objectType(ImplObject$Ref, {
  interfaces: [TestPrefixInterfaceMessage$Ref],
  fields: (t) => ({
    body: t.exposeString("body"),
  }),
  isTypeOf: (value: any) => value.$type === "ImplObject",
});
builder.queryField("testInterface", (t) =>
  t.field({
    type: ImplObject$Ref,
    resolve() {
      return {
        $type: "ImplObject" as const,
        id: 123n,
        body: "hello",
      };
    },
  }),
);

builder.objectField(
  TestPrefixPrefixedMessageInnerMessage$Ref,
  "skipResolver",
  (t) =>
    t.field({
      type: "String",
      nullable: false,
      resolve() {
        return "implemented";
      },
    }),
);
builder.queryField("testSkipResolver", (t) =>
  t.field({
    type: TestPrefixPrefixedMessage$Ref,
    resolve() {
      return new PrefixedMessage({
        squashedMessage: {
          squashedMessage: {
            case: "oneofField",
            value: {},
          },
        },
      });
    },
  }),
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
