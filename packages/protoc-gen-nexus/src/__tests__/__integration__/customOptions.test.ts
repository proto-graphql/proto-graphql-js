import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("extensions", "protobufjs", {
  extraSchema: `
    import { extendType, nonNull, queryField } from "nexus";

    export const innerImplementsInterface = extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        t.implements("TestPrefixInterfaceMessage");
      },
    });
    export const inner2ImplementsInterface = extendType({
      type: "TestPrefixPrefixedMessageInnerMessage2",
      definition(t) {
        t.implements("TestPrefixInterfaceMessage");
      },
    });
    export const implResolver = extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        t.field("skipResolver", {
          type: nonNull("String"),
          resolve() {
            return "implemented";
          },
        });
      },
    });
  `,
  schemaTests: [
    [
      "squashed union",
      {
        extraSchema: `
          import { queryField, nonNull } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/extensions";

          export const testQuery = queryField("test", {
            type: nonNull("TestPrefixPrefixedMessage"),
            resolve() {
              return new pbjs.testapis.extensions.PrefixedMessage({
                squashedMessage: new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage({
                  oneofField_2: new pbjs.testapis.extensions.PrefixedMessage.InnerMessage2({
                    body: "field 2",
                  }),
                }),
              });
            },
          });
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
          import { extendType, nonNull, queryField } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/extensions";

          export const addInterfaceMessageToPrefixedMessage = extendType({
            type: "TestPrefixPrefixedMessage",
            definition(t) {
              t.field("interfaceMessage", {
                type: nonNull("TestPrefixInterfaceMessage"),
                resolve(root) {
                  if (root.interfaceMessage == null) throw new Error("interfaceMessage is required");

                  if (root.interfaceMessage.type === pbjs.testapis.extensions.InterfaceMessage.Type.INNER) {
                    return new pbjs.testapis.extensions.PrefixedMessage.InnerMessage({
                      id: root.interfaceMessage.id,
                      body: "inner message",
                    });
                  }
                  if (root.interfaceMessage.type === pbjs.testapis.extensions.InterfaceMessage.Type.INNER2) {
                    return new pbjs.testapis.extensions.PrefixedMessage.InnerMessage2({
                      id: root.interfaceMessage.id,
                      body: "inner message2",
                    });
                  }
                  throw new Error(\`Unknown type: \${root.interfaceMessage.type}\`);
                },
              });
            },
          });
          export const testQuery = queryField("test", {
            type: nonNull("TestPrefixPrefixedMessage"),
            resolve() {
              return new pbjs.testapis.extensions.PrefixedMessage({
                interfaceMessage: new pbjs.testapis.extensions.InterfaceMessage({
                  id: 123,
                  type: pbjs.testapis.extensions.InterfaceMessage.Type.INNER2,
                }),
              });
            },
          });
        `,
        testQuery: `
          query Test {
            test {
              interfaceMessage {
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
  ],
});

testSchemaGeneration("extensions", "protobufjs", {
  extraSchema: `
    import { extendType, nonNull } from "nexus";

    export const implResolver = extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        t.field("skipResolver", {
          type: nonNull("String"),
          resolve() {
            return "implemented";
          },
        });
      },
    });
  `,
  schemaTests: [
    [
      "implement skipResolver field",
      {
        extraSchema: `
          import { queryField, nonNull } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/extensions";

          export const testQuery = queryField("test", {
            type: nonNull("TestPrefixPrefixedMessage"),
            resolve() {
              return new pbjs.testapis.extensions.PrefixedMessage({
                squashedMessage: new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage({
                  oneofField: new pbjs.testapis.extensions.PrefixedMessage.InnerMessage({}),
                }),
              });
            },
          });
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

testSchemaGeneration("extensions", "native protobuf", {
  schemaTests: [
    [
      "squashed union",
      {
        extraSchema: `
          import { queryField, nonNull } from "nexus";
          import * as pbnative from "@testapis/node-native/lib/testapis/extensions/extensions_pb";

          export const testQuery = queryField("test", {
            type: nonNull("TestPrefixPrefixedMessage"),
            resolve() {
              const inner2 = new pbnative.PrefixedMessage.InnerMessage2();
              inner2.setBody("field 2");
              const squashed = new pbnative.PrefixedMessage.SquashedMessage();
              squashed.setOneofField2(inner2);
              const msg = new pbnative.PrefixedMessage();
              msg.setSquashedMessage(squashed);
              return msg;
            },
          });
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
  ],
});
