import {
  MessageWithEnums,
  MyEnum,
  MyEnumWithoutUnspecified,
} from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/enums/enums";

import { MessageWithEnums$Ref } from "./__generated__/testapis/enums/enums.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (f) =>
  f.field({
    type: MessageWithEnums$Ref,
    resolve() {
      return MessageWithEnums.fromPartial({
        requiredMyEnum: MyEnum.MY_ENUM_BAR,
        requiredMyEnumWithoutUnspecified:
          MyEnumWithoutUnspecified.MY_ENUM_WITHOUT_UNSPECIFIED_FOO,
      });
    },
  }),
);

export const schema = builder.toSchema();
