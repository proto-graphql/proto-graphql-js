import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { MessageSchema } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/wktypes/well_known_types_pb.js";

import { Message$Ref } from "./__generated__/testapis/wktypes/well_known_types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return create(MessageSchema, {
        timestamp: timestampFromDate(new Date(1609137725453)),
        int32Value: 2,
        int64Value: 4n,
        uint32Value: 5,
        uint64Value: 6n,
        floatValue: 3.5,
        doubleValue: 2.4,
        boolValue: true,
        stringValue: "foobar",
      });
    },
  }),
);

builder.queryField("valuesAreBlank", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return create(MessageSchema, {});
    },
  }),
);

export const schema = builder.toSchema();
