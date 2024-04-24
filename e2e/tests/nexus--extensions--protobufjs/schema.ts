import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { extendType, nonNull, queryField } from "nexus";

import * as types2 from "./__generated__/schema/testapis/extensions/field_nullability/nullability_pb_nexus";
import * as types3 from "./__generated__/schema/testapis/extensions/ignored_pb_nexus";
import * as types4 from "./__generated__/schema/testapis/extensions/no_partial/no_partial_pb_nexus";

// should import at last
import * as pbjs from "@proto-graphql/e2e-testapis-protobufjs/lib/testapis/extensions";
import * as types1 from "./__generated__/schema/testapis/extensions/extensions_pb_nexus";

const testSquashedUnionQuery = queryField("testSquashedUnion", {
  type: nonNull("TestPrefixPrefixedMessage"),
  resolve() {
    return new pbjs.testapis.extensions.PrefixedMessage({
      squashedMessage:
        new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage({
          oneofField_2:
            new pbjs.testapis.extensions.PrefixedMessage.InnerMessage2({
              body: "field 2",
            }),
        }),
    });
  },
});

const innerImplementsInterface = extendType({
  type: "TestPrefixPrefixedMessageInnerMessage",
  definition(t) {
    t.implements("TestPrefixInterfaceMessage");
  },
});
const inner2ImplementsInterface = extendType({
  type: "TestPrefixPrefixedMessageInnerMessage2",
  definition(t) {
    t.implements("TestPrefixInterfaceMessage");
  },
});
const addInterfaceMessageToPrefixedMessage = extendType({
  type: "TestPrefixPrefixedMessage",
  definition(t) {
    t.field("interfaceMessage", {
      type: nonNull("TestPrefixInterfaceMessage"),
      resolve(root) {
        if (root.interfaceMessage == null)
          throw new Error("interfaceMessage is required");

        if (
          root.interfaceMessage.type ===
          pbjs.testapis.extensions.InterfaceMessage.Type.INNER
        ) {
          return new pbjs.testapis.extensions.PrefixedMessage.InnerMessage({
            id: root.interfaceMessage.id,
            body: "inner message",
          });
        }
        if (
          root.interfaceMessage.type ===
          pbjs.testapis.extensions.InterfaceMessage.Type.INNER2
        ) {
          return new pbjs.testapis.extensions.PrefixedMessage.InnerMessage2({
            id: root.interfaceMessage.id,
            body: "inner message2",
          });
        }
        throw new Error(`Unknown type: ${root.interfaceMessage.type}`);
      },
    });
  },
});
const testInterfaceQuery = queryField("testInterface", {
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

const implResolver = extendType({
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
const testSkipResolverQuery = queryField("testSkipResolver", {
  type: nonNull("TestPrefixPrefixedMessage"),
  resolve() {
    return new pbjs.testapis.extensions.PrefixedMessage({
      squashedMessage:
        new pbjs.testapis.extensions.PrefixedMessage.SquashedMessage({
          oneofField: new pbjs.testapis.extensions.PrefixedMessage.InnerMessage(
            {},
          ),
        }),
    });
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [
    types1,
    types2,
    types3,
    types4,
    testSquashedUnionQuery,
    innerImplementsInterface,
    inner2ImplementsInterface,
    addInterfaceMessageToPrefixedMessage,
    testInterfaceQuery,
    implResolver,
    testSkipResolverQuery,
  ],
});
