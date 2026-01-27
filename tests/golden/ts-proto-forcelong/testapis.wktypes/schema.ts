import { Message } from "@proto-graphql/e2e-testapis-ts-proto-with-forcelong-number/lib/testapis/wktypes/well_known_types";

import { Message$Ref } from "./__generated__/testapis/wktypes/well_known_types.pb.pothos.js";
import { builder } from "./builder.js";

builder.queryField("test", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        timestamp: new Date(1609137725453),
        int32Value: 2,
        int64Value: 4,
        uint32Value: 5,
        uint64Value: 6,
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
      return Message.fromPartial({});
    },
  }),
);

export const schema = builder.toSchema();
