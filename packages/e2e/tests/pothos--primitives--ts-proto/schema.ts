import { Message } from "@testapis/ts-proto/lib/testapis/primitives/primitives";
import { printGraphqlSchema } from "../../src/printGraphqlSchema";
import { Message$Ref } from "../__generated__/pothos/ts-proto/testapis/primitives/primitives.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return Message.fromPartial({
        requiredPrimitives: {
          requiredDoubleValue: 2.4,
          requiredFloatValue: 3.5,
          requiredInt32Value: 2,
          requiredInt64Value: "4",
          requiredUint32Value: 5,
          requiredUint64Value: "6",
          requiredSint32Value: 7,
          requiredSint64Value: "8",
          requiredFixed32Value: 9,
          requiredFixed64Value: "10",
          requiredSfixed32Value: 11,
          requiredSfixed64Value: "12",
          requiredBoolValue: true,
          requiredStringValue: "foobar",
        },
        requiredPrimitivesList: [],
      });
    },
  })
);

export const schema = builder.toSchema();

printGraphqlSchema({ schema, rootDir: __dirname });
