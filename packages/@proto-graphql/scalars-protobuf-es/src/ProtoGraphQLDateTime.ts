import { Timestamp } from "@bufbuild/protobuf";
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
    if (value instanceof Timestamp) {
      return dateTimeConfig.serialize(value.toDate());
    }
    return dateTimeConfig.serialize(value);
  },
  parseValue(value) {
    return Timestamp.fromDate(dateTimeConfig.parseValue(value));
  },
  parseLiteral(value) {
    return Timestamp.fromDate(dateTimeConfig.parseLiteral(value));
  },
});
