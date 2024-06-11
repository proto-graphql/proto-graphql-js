import { printGraphqlSchema } from "@proto-graphql/e2e-helper";
import {
  MessageWithEnums,
  MyEnum,
  MyEnumWithoutUnspecified,
} from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/enums/enums_pb";

import { MessageWithEnums$Ref } from "./__generated__/schema/testapis/enums/enums.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (f) =>
  f.field({
    type: MessageWithEnums$Ref,
    resolve() {
      return new MessageWithEnums({
        requiredMyEnum: MyEnum.BAR,
        requiredMyEnumWithoutUnspecified: MyEnumWithoutUnspecified.FOO,
      });
    },
  }),
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
