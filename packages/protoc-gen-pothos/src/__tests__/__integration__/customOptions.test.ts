import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("extensions", "ts-proto", {
  schemaTests: [
    [
      "squashed union",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { PrefixedMessage } from "@testapis/ts-proto/lib/testapis/extensions/extensions";
          import { TestPrefixPrefixedMessage$Ref } from "./testapis/extensions/extensions.pb.pothos";

          builder.queryField("test", (t) => t.field({
            type: TestPrefixPrefixedMessage$Ref,
            resolve() {
              return  PrefixedMessage.fromPartial({
                squashedMessage: {
                  oneofField2: {
                    body: "field 2",
                  },
                },
              });
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              squashedMessage {
                ... on TestPrefixPrefixedMessageInnerMessage {
                  ...Inner
                }
                ... on TestPrefixPrefixedMessageInnerMessage2 {
                  ...Inner2
                }
              }
            }
          }
          fragment Inner on TestPrefixPrefixedMessageInnerMessage {
            body
          }
          fragment Inner2 on TestPrefixPrefixedMessageInnerMessage2 {
            body
          }
        `,
      },
    ],
    [
      "interface",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { TestPrefixInterfaceMessage$Ref } from "./testapis/extensions/extensions.pb.pothos";

          const ImplObject$Ref = builder.objectRef<{ id: string, body: string, $type: "ImplObject" }>("ImplObject");
          builder.objectType(ImplObject$Ref, {
            interfaces: [TestPrefixInterfaceMessage$Ref],
            fields: (t) => ({
              body: t.exposeString("body"),
            }),
            isTypeOf: (value: any) => value.$type === "ImplObject"
          });
          builder.queryField("test", (t) => t.field({
            type: ImplObject$Ref,
            resolve() {
              return {
                $type: "ImplObject" as const,
                id: "123",
                body: "hello",
              };
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              ... on ImplObject {
                id
                body
              }
            }
          }
        `,
      },
    ],
  ],
});

testSchemaGeneration("extensions", "ts-proto", {
  schemaTests: [
    [
      "implement skipResolver field",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { PrefixedMessage } from "@testapis/ts-proto/lib/testapis/extensions/extensions";
          import { TestPrefixPrefixedMessage$Ref, TestPrefixPrefixedMessageInnerMessage$Ref } from "./testapis/extensions/extensions.pb.pothos";

          builder.objectField(TestPrefixPrefixedMessageInnerMessage$Ref, "skipResolver", (t) =>
            t.field({
              type: "String",
              nullable: false,
              resolve() {
                return "implemented";
              },
            }),
          );

          builder.queryField("test", (t) => t.field({
            type: TestPrefixPrefixedMessage$Ref,
            resolve() {
              return PrefixedMessage.fromPartial({
                squashedMessage: {
                  oneofField: {},
                },
              });
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              squashedMessage {
                ... on TestPrefixPrefixedMessageInnerMessage {
                  ...Inner
                }
              }
            }
          }
          fragment Inner on TestPrefixPrefixedMessageInnerMessage {
            skipResolver
          }
        `,
      },
    ],
  ],
});
