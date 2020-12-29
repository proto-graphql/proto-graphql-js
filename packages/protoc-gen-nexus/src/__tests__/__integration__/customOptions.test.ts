import { graphql } from "graphql";
import { nonNull, queryField } from "nexus";
import * as pbjs from "@testapis/node/lib/testapis/extensions";
import * as pbnative from "@testapis/node-native/lib/testapis/extensions/extensions_pb";
import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("extensions", "protobufjs", {
  schemaTests: [
    [
      "squashed union",
      {
        test: queryField("test", {
          type: nonNull("TestPrefixPrefixedMessage"),
          resolve() {
            return new pbjs.testapis.extensions.PrefixedMessage({
              squashedMessage: new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage(
                {
                  oneofIgnoredField_2: new pbjs.testapis.extensions.PrefixedMessage.InnerMessage2(
                    {
                      body: "field 2",
                    }
                  ),
                }
              ),
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
            squashed.setOneofIgnoredField2(inner2);
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
