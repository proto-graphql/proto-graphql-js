import { OneofMessage1, SquashedOneof } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_squashed_union/pkg1/types_pb.js";
import { Message } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/edgecases/import_squashed_union/pkg2/types_pb.js";

import { SquashedOneof$Ref, OneofMessage1$Ref } from "./__generated__/testapis/edgecases/import_squashed_union/pkg1/types.pb.pothos.js";
import { Message$Ref } from "./__generated__/testapis/edgecases/import_squashed_union/pkg2/types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("squashedOneof", (t) =>
  t.field({
    type: SquashedOneof$Ref,
    resolve() {
      return new OneofMessage1({
        body: "hello from pkg1 squashed oneof",
      });
    },
  }),
);

builder.queryField("oneofMessage1", (t) =>
  t.field({
    type: OneofMessage1$Ref,
    resolve() {
      return new OneofMessage1({
        body: "hello from pkg1 oneof message1",
      });
    },
  }),
);

builder.queryField("pkg2Message", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return new Message({
        msg: new SquashedOneof({
          message: {
            case: "msg1",
            value: new OneofMessage1({ body: "hello from pkg2" }),
          },
        }),
      });
    },
  }),
);

export const schema = builder.toSchema();
