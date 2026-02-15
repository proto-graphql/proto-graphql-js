import { DeprecatedMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/deprecation/deprecation_pb.js";
import { DeprecatedFileMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/deprecation/file_deprecation_pb.js";

import { DeprecatedMessage$Ref } from "./__generated__/testapis/deprecation/deprecation.pb.pothos.js";
import { DeprecatedFileMessage$Ref } from "./__generated__/testapis/deprecation/file_deprecation.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test1", (t) =>
  t.field({
    type: DeprecatedMessage$Ref,
    resolve() {
      return new DeprecatedMessage({
        body: "hello",
      });
    },
  }),
);

builder.queryField("test2", (t) =>
  t.field({
    type: DeprecatedFileMessage$Ref,
    resolve() {
      return new DeprecatedFileMessage({
        body: "world",
      });
    },
  }),
);

export const schema = builder.toSchema();
