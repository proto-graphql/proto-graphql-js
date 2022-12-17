import { Message } from "@testapis/ts-proto/lib/testapis/wktypes/well_known_types";

import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { Message$Ref } from "../__generated__/pothos/ts-proto/testapis/wktypes/well_known_types.pb.pothos";
import { builder } from "./builder";

builder.queryField("valuesArePresent", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        timestamp: new Date(1609137725453),
        int32Value: 2,
        int64Value: "4",
        uint32Value: 5,
        uint64Value: "6",
        floatValue: 3.5,
        doubleValue: 2.4,
        boolValue: true,
        stringValue: "foobar",
      });
    },
  })
);

builder.queryField("valuesAreBlank", (f) =>
  f.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({});
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
