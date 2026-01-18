import { create } from "@bufbuild/protobuf";
import {
  DeprecatedMessage,
  DeprecatedMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/deprecation/deprecation_pb";
import {
  DeprecatedFileMessage,
  DeprecatedFileMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/deprecation/file_deprecation_pb";

import { DeprecatedMessage$Ref } from "./__generated__/schema/testapis/deprecation/deprecation.pb.pothos";
import { DeprecatedFileMessage$Ref } from "./__generated__/schema/testapis/deprecation/file_deprecation.pb.pothos";
import { builder } from "./builder";

builder.queryField("test1", (t) =>
  t.field({
    type: DeprecatedMessage$Ref,
    resolve() {
      return create(DeprecatedMessageSchema, {
        body: "hello",
      });
    },
  }),
);

builder.queryField("test2", (t) =>
  t.field({
    type: DeprecatedFileMessage$Ref,
    resolve() {
      return create(DeprecatedFileMessageSchema, {
        body: "world",
      });
    },
  }),
);

export const schema = builder.toSchema();
