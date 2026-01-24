import { SubpkgEnum } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/multipkgs/subpkg1/types";
import { MessageWithSubpkg } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/multipkgs/subpkg2/types";

import { MessageWithSubpkg$Ref } from "./__generated__/testapis/multipkgs/subpkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (t) =>
  t.field({
    type: MessageWithSubpkg$Ref,
    resolve() {
      return MessageWithSubpkg.fromPartial({
        message: {
          body: "hello",
        },
        enum: SubpkgEnum.BAR,
      });
    },
  }),
);

export const schema = builder.toSchema();
