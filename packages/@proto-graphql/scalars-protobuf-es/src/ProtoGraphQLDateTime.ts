import { isMessage } from "@bufbuild/protobuf";
import {
  type Timestamp,
  TimestampSchema,
  timestampDate,
  timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import { GraphQLScalarType } from "graphql";
import { GraphQLDateTime } from "graphql-scalars";

const dateTimeConfig = GraphQLDateTime.toConfig();

export const ProtoGraphQLDateTime = /*#__PURE__*/ new GraphQLScalarType<
  Timestamp,
  Date
>({
  name: dateTimeConfig.name,
  description: dateTimeConfig.description,
  serialize(value) {
    if (isMessage(value, TimestampSchema)) {
      return dateTimeConfig.serialize(timestampDate(value));
    }
    return dateTimeConfig.serialize(value);
  },
  parseValue(value) {
    return timestampFromDate(dateTimeConfig.parseValue(value));
  },
  parseLiteral(value) {
    return timestampFromDate(dateTimeConfig.parseLiteral(value));
  },
});
