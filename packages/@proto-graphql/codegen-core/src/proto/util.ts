import type { DescField } from "@bufbuild/protobuf";

export type DescMessageField = Extract<
  DescField,
  { fieldKind: "message" } | { fieldKind: "list"; listKind: "message" }
>;

export type DescEnumField = Extract<
  DescField,
  { fieldKind: "enum" } | { fieldKind: "list"; listKind: "enum" }
>;

export type DescScalarField = Extract<
  DescField,
  { fieldKind: "scalar" } | { fieldKind: "list"; listKind: "scalar" }
>;

export type DescMapField = Extract<DescField, { fieldKind: "map" }>;

export type DescListField = Extract<DescField, { fieldKind: "list" }>;

export function isListField(f: DescField): f is DescListField {
  return f.fieldKind === "list";
}

export function isMessageField(f: DescField): f is DescMessageField {
  return (
    f.fieldKind === "message" ||
    (f.fieldKind === "list" && f.listKind === "message")
  );
}

export function isEnumField(f: DescField): f is DescEnumField {
  return (
    f.fieldKind === "enum" || (f.fieldKind === "list" && f.listKind === "enum")
  );
}

export function isScalarField(f: DescField): f is DescScalarField {
  return (
    f.fieldKind === "scalar" ||
    (f.fieldKind === "list" && f.listKind === "scalar")
  );
}

export function isMapField(f: DescField): f is DescMapField {
  return f.fieldKind === "map";
}
