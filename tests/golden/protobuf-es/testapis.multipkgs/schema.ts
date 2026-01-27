import { create } from "@bufbuild/protobuf";
import {
  SubpkgEnum,
  SubpkgMessageSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg1/types_pb.js";
import { MessageWithSubpkgSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/multipkgs/subpkg2/types_pb.js";

import { SubpkgMessage$Ref } from "./__generated__/testapis/multipkgs/subpkg1/types.pb.pothos.js";
import { MessageWithSubpkg$Ref } from "./__generated__/testapis/multipkgs/subpkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("subpkg1Message", (t) =>
  t.field({
    type: SubpkgMessage$Ref,
    resolve() {
      return create(SubpkgMessageSchema, {
        body: "hello from subpkg1",
      });
    },
  }),
);

builder.queryField("subpkg2Message", (t) =>
  t.field({
    type: MessageWithSubpkg$Ref,
    resolve() {
      return create(MessageWithSubpkgSchema, {
        message: {
          body: "hello from subpkg2",
        },
        enum: SubpkgEnum.BAR,
      });
    },
  }),
);

export const schema = builder.toSchema();
