import { DeprecatedMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/deprecation/deprecation_pb";
import { DeprecatedFileMessage } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/deprecation/file_deprecation_pb";

import { DeprecatedMessage$Ref } from "./__generated__/schema/testapis/deprecation/deprecation.pb.pothos";
import { DeprecatedFileMessage$Ref } from "./__generated__/schema/testapis/deprecation/file_deprecation.pb.pothos";
import { builder } from "./builder";

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
