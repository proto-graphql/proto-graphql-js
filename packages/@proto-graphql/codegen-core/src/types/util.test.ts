import { createFileRegistry } from "@bufbuild/protobuf";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, it } from "vitest";
import { isRequiredField } from "./util";

describe("isRequiredField", () => {
  it.each<{
    context: string;
    pkg: TestapisPackage;
    typeName: string;
    fieldName: string;
    fieldType: "output" | "input" | "partial_input";
    want: boolean;
  }>([
    {
      context: "comment starts with `Requried.`",
      pkg: "testapis.field_behavior",
      typeName: "FieldBehaviorComentsMessage",
      fieldName: "requiredField",
      fieldType: "output",
      want: true,
    },
    {
      context: "comment contains `Requried.`",
      pkg: "testapis.field_behavior",
      typeName: "FieldBehaviorComentsMessage",
      fieldName: "outputOnlyRequiredField",
      fieldType: "output",
      want: true,
    },
    {
      context: "comment does not contain `Requried.`",
      pkg: "testapis.field_behavior",
      typeName: "FieldBehaviorComentsMessage",
      fieldName: "outputOnlyField",
      fieldType: "output",
      want: false,
    },
    {
      context: "field is primitive",
      pkg: "testapis.proto3_optional",
      typeName: "Message",
      fieldName: "requiredStringValue",
      fieldType: "output",
      want: true,
    },
    {
      context: "field is primitive but optional",
      pkg: "testapis.proto3_optional",
      typeName: "Message",
      fieldName: "optionalStringValue",
      fieldType: "output",
      want: false,
    },
    {
      context: "field is primitive but input_nullability is NULLABLE",
      pkg: "testapis.extensions.field_nullability",
      typeName: "Message",
      fieldName: "userId",
      fieldType: "input",
      want: false,
    },
    {
      context: "field is enum but output_nullability is NULLABLE",
      pkg: "testapis.extensions.field_nullability",
      typeName: "Message",
      fieldName: "status",
      fieldType: "output",
      want: false,
    },
  ])(
    "returns $want for $fieldType field when $context",
    ({ pkg, typeName, fieldName, fieldType, want }) => {
      const fds = getTestapisFileDescriptorSet(pkg);
      const registry = createFileRegistry(fds);
      const qualifiedName = `${pkg}.${typeName}`;
      const msgDesc = registry.getMessage(qualifiedName);
      if (msgDesc == null) {
        throw new Error(`${qualifiedName} not found`);
      }
      const fieldDesc = msgDesc.field[fieldName];
      if (fieldDesc == null) {
        throw new Error(`${qualifiedName}.${fieldName} not found`);
      }

      expect(isRequiredField(fieldDesc, fieldType)).toBe(want);
    },
  );
});
