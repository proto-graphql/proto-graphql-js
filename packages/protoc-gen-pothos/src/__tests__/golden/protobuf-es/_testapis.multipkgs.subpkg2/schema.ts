import { create } from "@bufbuild/protobuf";
import { SubpkgEnum } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg1/types_pb.js";
import { MessageWithSubpkgSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg2/types_pb.js";

import { MessageWithSubpkg$Ref } from "./__generated__/testapis/multipkgs/subpkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

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
