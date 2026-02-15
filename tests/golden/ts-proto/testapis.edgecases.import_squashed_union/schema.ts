import { OneofMessage1 } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/edgecases/import_squashed_union/pkg1/types";
import { Message } from "@proto-graphql/e2e-testapis-ts-proto/lib/testapis/edgecases/import_squashed_union/pkg2/types";

import {
  OneofMessage1$Ref,
  SquashedOneof$Ref,
} from "./__generated__/testapis/edgecases/import_squashed_union/pkg1/types.pb.pothos.js";
import { Message$Ref } from "./__generated__/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("squashedOneof", (t) =>
  t.field({
    type: SquashedOneof$Ref,
    resolve() {
      return OneofMessage1.fromPartial({
        body: "hello from pkg1 squashed oneof",
      });
    },
  }),
);

builder.queryField("oneofMessage1", (t) =>
  t.field({
    type: OneofMessage1$Ref,
    resolve() {
      return OneofMessage1.fromPartial({
        body: "hello from pkg1 oneof message1",
      });
    },
  }),
);

builder.queryField("pkg2Message", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        msg: {
          msg1: { body: "hello from pkg2" },
        },
      });
    },
  }),
);

export const schema = builder.toSchema();
