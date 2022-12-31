import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@proto-graphql/e2e-testapis-protobufjs/lib/testapis/enums";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/enums/enums_pb_nexus";

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
