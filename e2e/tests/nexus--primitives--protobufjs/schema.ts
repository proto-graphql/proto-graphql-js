import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@proto-graphql/e2e-testapis-protobufjs/lib/testapis/primitives";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/primitives/primitives_pb_nexus";

const testQuery = queryField("test", {
  type: "Message",
  resolve() {
    return new pbjs.testapis.primitives.Message({
      requiredPrimitives: new pbjs.testapis.primitives.Primitives({
        requiredDoubleValue: 2.4,
        requiredFloatValue: 3.5,
        requiredInt32Value: 2,
        requiredInt64Value: 4,
        requiredUint32Value: 5,
        requiredUint64Value: 6,
        requiredSint32Value: 7,
        requiredSint64Value: 8,
        requiredFixed32Value: 9,
        requiredFixed64Value: 10,
        requiredSfixed32Value: 11,
        requiredSfixed64Value: 12,
        requiredBoolValue: true,
        requiredStringValue: "foobar",
      }),
      requiredPrimitivesList: [],
    });
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
