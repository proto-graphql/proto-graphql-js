import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { Kind } from "graphql";
import { describe, expect, it } from "vitest";
import { ProtoGraphQLDateTime } from "./ProtoGraphQLDateTime.js";

describe("ProtoGraphQLDateTime", () => {
  const referenceDate = new Date("2024-01-15T12:30:00.000Z");

  describe("serialize", () => {
    it("converts a Timestamp message to a Date", () => {
      const timestamp = timestampFromDate(referenceDate);
      const result = ProtoGraphQLDateTime.serialize(timestamp);
      expect(result).toEqual(referenceDate);
    });

    it("delegates non-Timestamp values to GraphQLDateTime", () => {
      const result = ProtoGraphQLDateTime.serialize(referenceDate);
      expect(result).toEqual(referenceDate);
    });
  });

  describe("parseValue", () => {
    it("parses a DateTime string into a Timestamp message", () => {
      const result = ProtoGraphQLDateTime.parseValue(
        referenceDate.toISOString(),
      );
      expect(result).toEqual(timestampFromDate(referenceDate));
    });
  });

  describe("parseLiteral", () => {
    it("parses an AST StringValue node into a Timestamp message", () => {
      const result = ProtoGraphQLDateTime.parseLiteral({
        kind: Kind.STRING,
        value: referenceDate.toISOString(),
      });
      expect(result).toEqual(timestampFromDate(referenceDate));
    });
  });
});
