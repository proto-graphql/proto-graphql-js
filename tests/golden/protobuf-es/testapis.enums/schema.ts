import { create } from "@bufbuild/protobuf";
import {
  MessageWithEnumsSchema,
  MyEnum,
  MyEnumWithoutUnspecified,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/enums/enums_pb.js";

import { MessageWithEnums$Ref } from "./__generated__/testapis/enums/enums.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (f) =>
  f.field({
    type: MessageWithEnums$Ref,
    resolve() {
      return create(MessageWithEnumsSchema, {
        requiredMyEnum: MyEnum.BAR,
        requiredMyEnumWithoutUnspecified: MyEnumWithoutUnspecified.FOO,
      });
    },
  }),
);

export const schema = builder.toSchema();
