import * as pbjs from "@testapis/node/lib/testapis/enums";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/enums/enums_pb_nexus";

const testQuery = queryField("test", {
  type: "MessageWithEnums",
  resolve() {
    return new pbjs.testapi.enums.MessageWithEnums({
      requiredMyEnum: pbjs.testapi.enums.MyEnum.MY_ENUM_BAR,
      requiredMyEnumWithoutUnspecified:
        pbjs.testapi.enums.MyEnumWithoutUnspecified
          .MY_ENUM_WITHOUT_UNSPECIFIED_FOO,
    });
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
