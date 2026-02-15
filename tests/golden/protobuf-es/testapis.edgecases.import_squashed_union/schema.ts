import { create } from "@bufbuild/protobuf";
import {
  OneofMessage1Schema,
  SquashedOneofSchema,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/edgecases/import_squashed_union/pkg1/types_pb.js";
import { MessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/edgecases/import_squashed_union/pkg2/types_pb.js";

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
      return create(OneofMessage1Schema, {
        body: "hello from pkg1 squashed oneof",
      });
    },
  }),
);

builder.queryField("oneofMessage1", (t) =>
  t.field({
    type: OneofMessage1$Ref,
    resolve() {
      return create(OneofMessage1Schema, {
        body: "hello from pkg1 oneof message1",
      });
    },
  }),
);

builder.queryField("pkg2Message", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return create(MessageSchema, {
        msg: create(SquashedOneofSchema, {
          message: {
            case: "msg1",
            value: create(OneofMessage1Schema, { body: "hello from pkg2" }),
          },
        }),
      });
    },
  }),
);

export const schema = builder.toSchema();
