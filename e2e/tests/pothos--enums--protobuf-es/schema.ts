import { create } from "@bufbuild/protobuf";
import {
  MessageWithEnums,
  MessageWithEnumsSchema,
  MyEnum,
  MyEnumWithoutUnspecified,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/enums/enums_pb";

import { MessageWithEnums$Ref } from "./__generated__/schema/testapis/enums/enums.pb.pothos";
import { builder } from "./builder";

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
