import { Message } from "@proto-graphql/e2e-testapis-protobuf-es/lib/testapis/primitives/primitives_pb";

import { Message$Ref } from "./__generated__/schema/testapis/primitives/primitives.pb.pothos";
import { builder } from "./builder";

builder.queryField("test", (t) =>
  t.field({
    type: Message$Ref,
    resolve() {
      return new Message({
        requiredPrimitives: {
          requiredDoubleValue: 2.4,
          requiredFloatValue: 3.5,
          requiredInt32Value: 2,
          requiredInt64Value: 4n,
          requiredUint32Value: 5,
          requiredUint64Value: 6n,
          requiredSint32Value: 7,
          requiredSint64Value: 8n,
          requiredFixed32Value: 9,
          requiredFixed64Value: 10n,
          requiredSfixed32Value: 11,
          requiredSfixed64Value: 12n,
          requiredBoolValue: true,
          requiredStringValue: "foobar",
        },
        requiredPrimitivesList: [],
      });
    },
  }),
);

export const schema = builder.toSchema();
