import { PrefixedMessage } from "@testapis/node-native/lib/testapis/extensions/extensions_pb";
import { queryField, nonNull } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/extensions/extensions_pb_nexus";
import * as types2 from "../__generated__/nexus/google-protobuf/testapis/extensions/field_nullability/nullability_pb_nexus";
import * as types3 from "../__generated__/nexus/google-protobuf/testapis/extensions/ignored_pb_nexus";
import * as types4 from "../__generated__/nexus/google-protobuf/testapis/extensions/no_partial/no_partial_pb_nexus";

const testQuery = queryField("test", {
  type: nonNull("TestPrefixPrefixedMessage"),
  resolve() {
    const inner2 = new PrefixedMessage.InnerMessage2();
    inner2.setBody("field 2");
    const squashed = new PrefixedMessage.SquashedMessage();
    squashed.setOneofField2(inner2);
    const msg = new PrefixedMessage();
    msg.setSquashedMessage(squashed);
    return msg;
  },
});
export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, types2, types3, types4, testQuery],
});
