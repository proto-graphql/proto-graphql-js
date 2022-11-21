import * as pbjs from "@testapis/node/lib/testapis/deprecation";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/deprecation/deprecation_pb_nexus";
import * as types2 from "../__generated__/nexus/protobufjs/testapis/deprecation/file_deprecation_pb_nexus";

const testQuery = queryField("test1", {
  type: "DeprecatedMessage",
  resolve() {
    return new pbjs.testapis.deprecation.DeprecatedMessage();
  },
});

export const schema = makeTestSchema({ rootDir: __dirname, types: [types1, types2, testQuery] });
