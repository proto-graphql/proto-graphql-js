import { graphql } from "graphql";
import { extendType, nonNull, queryField } from "nexus";
import * as pbjs from "@testapis/node/lib/testapis/extensions";
import * as pbnative from "@testapis/node-native/lib/testapis/extensions/extensions_pb";
import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("extensions", "protobufjs", {
  types: {
    innerImplementsInterface: extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        // @ts-expect-error FIXME: `t` does not have `implements` method
        t.implements("TestPrefixInterfaceMessage");
      },
    }),
    inner2ImplementsInterface: extendType({
      type: "TestPrefixPrefixedMessageInnerMessage2",
      definition(t) {
        // @ts-expect-error FIXME: `t` does not have `implements` method
        t.implements("TestPrefixInterfaceMessage");
      },
    }),
    implResolver: extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        t.field("skipResolver", {
          type: nonNull("String"),
          resolve() {
            return "implemented";
          },
        });
      },
    }),
  },
  schemaTests: [
    [
      "squashed union",
      {
        test: queryField("test", {
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
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
    [
      "interface",
      {
        addInterfaceMessageToPrefixedMessage: extendType({
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
                throw new Error(`Unknown type: ${root.interfaceMessage.type}`);
              },
            });
          },
        }),
        test: queryField("test", {
          type: nonNull("TestPrefixPrefixedMessage"),
          resolve() {
            return new pbjs.testapis.extensions.PrefixedMessage({
              interfaceMessage: new pbjs.testapis.extensions.InterfaceMessage({
                id: 123,
                type: pbjs.testapis.extensions.InterfaceMessage.Type.INNER2,
              }),
            });
          },
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});

testSchemaGeneration("extensions", "protobufjs", {
  types: {
    implResolver: extendType({
      type: "TestPrefixPrefixedMessageInnerMessage",
      definition(t) {
        t.field("skipResolver", {
          type: nonNull("String"),
          resolve() {
            return "implemented";
          },
        });
      },
    }),
  },
  schemaTests: [
    [
      "implement skipResolver field",
      {
        test: queryField("test", {
          type: nonNull("TestPrefixPrefixedMessage"),
          resolve() {
            return new pbjs.testapis.extensions.PrefixedMessage({
              squashedMessage: new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage({
                oneofField: new pbjs.testapis.extensions.PrefixedMessage.InnerMessage({}),
              }),
            });
          },
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});

testSchemaGeneration("extensions", "native protobuf", {
  schemaTests: [
    [
      "squashed union",
      {
        test: queryField("test", {
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
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});
