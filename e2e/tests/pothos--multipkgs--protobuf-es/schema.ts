import { create } from "@bufbuild/protobuf";
import { SubpkgEnum } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg1/types_pb";
import {
  MessageWithSubpkg,
  MessageWithSubpkgSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg2/types_pb";

import { MessageWithSubpkg$Ref } from "./__generated__/schema/testapis/multipkgs/subpkg2/types.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: MessageWithSubpkg$Ref,
    resolve() {
      return create(MessageWithSubpkgSchema, {
        message: {
          body: "hello",
        },
        enum: SubpkgEnum.BAR,
      });
    },
  }),
);

export const schema = builder.toSchema();
