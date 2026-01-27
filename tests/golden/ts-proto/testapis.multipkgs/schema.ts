import { SubpkgEnum, SubpkgMessage } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/multipkgs/subpkg1/types";
import { MessageWithSubpkg } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/multipkgs/subpkg2/types";

import { SubpkgMessage$Ref } from "./__generated__/testapis/multipkgs/subpkg1/types.pb.pothos.js";
import { MessageWithSubpkg$Ref } from "./__generated__/testapis/multipkgs/subpkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("subpkg1Message", (t) =>
  t.field({
    type: SubpkgMessage$Ref,
    resolve() {
      return SubpkgMessage.fromPartial({
        body: "hello from subpkg1",
      });
    },
  }),
);

builder.queryField("subpkg2Message", (t) =>
  t.field({
    type: MessageWithSubpkg$Ref,
    resolve() {
      return MessageWithSubpkg.fromPartial({
        message: {
          body: "hello from subpkg2",
        },
        enum: SubpkgEnum.BAR,
      });
    },
  }),
);

export const schema = builder.toSchema();
