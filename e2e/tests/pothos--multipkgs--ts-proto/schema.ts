import { SubpkgEnum } from "@testapis/ts-proto/lib/testapis/multipkgs/subpkg1/types";
import { MessageWithSubpkg } from "@testapis/ts-proto/lib/testapis/multipkgs/subpkg2/types";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { MessageWithSubpkg$Ref } from "../__generated__/pothos/ts-proto/testapis/multipkgs/subpkg2/types.pb.pothos";
import { builder } from "./builder";

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
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
