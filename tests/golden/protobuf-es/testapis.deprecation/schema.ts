import { create } from "@bufbuild/protobuf";
import { DeprecatedMessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/deprecation/deprecation_pb.js";
import { DeprecatedFileMessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/deprecation/file_deprecation_pb.js";

import { DeprecatedMessage$Ref } from "./__generated__/testapis/deprecation/deprecation.pb.pothos.js";
import { DeprecatedFileMessage$Ref } from "./__generated__/testapis/deprecation/file_deprecation.pb.pothos.js";
import { builder } from "./builder.js";

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
