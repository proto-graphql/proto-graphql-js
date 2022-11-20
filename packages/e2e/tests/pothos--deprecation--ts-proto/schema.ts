import { DeprecatedMessage } from "@testapis/ts-proto/lib/testapis/deprecation/deprecation";
import { DeprecatedFileMessage } from "@testapis/ts-proto/lib/testapis/deprecation/file_deprecation";
import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { DeprecatedMessage$Ref } from "../__generated__/pothos/ts-proto/testapis/deprecation/deprecation.pb.pothos";
import { DeprecatedFileMessage$Ref } from "../__generated__/pothos/ts-proto/testapis/deprecation/file_deprecation.pb.pothos";
import { builder } from "./builder";

builder.queryField("test1", (t) =>
  t.field({
    type: DeprecatedMessage$Ref,
    resolve() {
      return DeprecatedMessage.fromPartial({
        body: "hello",
      });
    },
  })
);

builder.queryField("test2", (t) =>
  t.field({
    type: DeprecatedFileMessage$Ref,
    resolve() {
      return DeprecatedFileMessage.fromPartial({
        body: "world",
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
