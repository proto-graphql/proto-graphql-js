import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import { PrefixedMessage } from "@testapis/ts-proto/lib/testapis/extensions/extensions";

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
      return PrefixedMessage.fromPartial({
        squashedMessage: {
          oneofField2: {
            body: "field 2",
          },
        },
      });
    },
  })
);

const ImplObject$Ref = builder.objectRef<{
  id: string;
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
        id: "123",
        body: "hello",
      };
    },
  })
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
    })
);
builder.queryField("testSkipResolver", (t) =>
  t.field({
    type: TestPrefixPrefixedMessage$Ref,
    resolve() {
      return PrefixedMessage.fromPartial({
        squashedMessage: {
          oneofField: {},
        },
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
