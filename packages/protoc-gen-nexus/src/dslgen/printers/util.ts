import {
  EnumType,
  EnumTypeValue,
  FullName,
  generatedGraphQLTypeImportPath,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  PrinterOptions,
  ScalarType,
  SquashedOneofUnionType,
  uniqueImportAlias,
} from "@proto-graphql/codegen-core";
import { ProtoField, ProtoMessage, ProtoScalarType } from "@proto-graphql/proto-descriptors";
import { code, Code, def, imp, Import } from "ts-poet";
import ts from "typescript";

export type NexusPrinterOptions = Extract<PrinterOptions, { dsl: "nexus" }>;

export function impNexus(name: string): Import {
  return imp(`${name}@nexus`);
}

export function impProtoNexus(name: string): Import {
  return imp(`${name}@proto-nexus`);
}

export function nexusTypeDef(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType
): Code {
  return code`${def(type.typeName)}`;
}

const longScalarPrimitiveTypes: ReadonlySet<ProtoScalarType> = new Set([
  "int64",
  "uint64",
  "fixed64",
  "sfixed64",
  "sint64",
]);
const longScalarWrapperTypes: ReadonlySet<string> = new Set([
  "google.protobuf.Int64Value",
  "google.protobuf.UInt64Value",
]);

export function isProtobufLong(proto: ProtoField): boolean {
  switch (proto.type.kind) {
    case "Scalar":
      return longScalarPrimitiveTypes.has(proto.type.type);
    case "Message":
      return longScalarWrapperTypes.has(proto.type.fullName.toString());
    default:
      return false;
  }
}

export function fieldType(
  field:
    | ObjectField<ObjectType | EnumType | InterfaceType | SquashedOneofUnionType>
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: NexusPrinterOptions
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath) return code`${imp(`${field.type.typeName}@${importPath}`)}`;
  return code`${field.type.typeName}`;
}

export function isWellKnownType(proto: ProtoField["type"]): proto is ProtoMessage {
  return proto.kind === "Message" && proto.file.name.startsWith("google/protobuf/");
}

/**
 * @example
 * ```
 * nexus.objectType(...)
 * ```
 */
export function createNexusCallExpr(name: string, args: readonly ts.Expression[]): ts.Expression {
  return ts.factory.createCallExpression(createNexusProp(name), undefined, args);
}

/**
 * @example
 * ```
 * nexus.objectType
 * ```
 */
export function createNexusProp(name: string): ts.Expression {
  return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("nexus"), name);
}

/**
 * @example
 * ```
 * proto_nexus.Transformer
 * ```
 */
export function createProtoNexusProp(name: string): ts.Expression {
  return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(uniqueImportAlias("proto-nexus")), name);
}

/**
 * @example
 * ```
 * proto_nexus.Transformer
 * ```
 */
export function createProtoNexusType(name: string): ts.QualifiedName {
  return ts.factory.createQualifiedName(ts.factory.createIdentifier(uniqueImportAlias("proto-nexus")), name);
}

/**
 * @example
 * ```
 * proto_nexus.stringToNumber(...)
 * ```
 */
export function createProtoNexusCallExpr(name: string, args: readonly ts.Expression[]): ts.Expression {
  return ts.factory.createCallExpression(createProtoNexusProp(name), undefined, args);
}

export function createDescriptionPropertyAssignment(
  gql:
    | ObjectType
    | InputObjectType
    | InterfaceType
    | OneofUnionType
    | SquashedOneofUnionType
    | EnumType
    | ObjectField<any>
    | ObjectOneofField
    | InputObjectField<any>
    | EnumTypeValue
): ts.PropertyAssignment | null {
  if (!gql.description) return null;
  return ts.factory.createPropertyAssignment("description", ts.factory.createStringLiteral(gql.description));
}

export function createDeprecationPropertyAssignment(
  gql: ObjectField<any> | ObjectOneofField | InputObjectField<any> | EnumTypeValue
): ts.PropertyAssignment | null {
  const reason = gql.deprecationReason;
  if (!reason) return null;

  return ts.factory.createPropertyAssignment("deprecation", ts.factory.createStringLiteral(reason));
}

export function fullNameString(fn: FullName): string {
  if (typeof fn === "string") {
    return fn;
  }
  return `${typeof fn[0] === "string" ? fn[0] : fullNameString(fn[0])}.${fn[1]}`;
}

export function createFullNameExpr(fn: FullName): ts.Expression {
  if (typeof fn === "string") {
    return ts.factory.createIdentifier(fn);
  }
  return ts.factory.createPropertyAccessExpression(
    typeof fn[0] === "string" ? ts.factory.createIdentifier(fn[0]) : createFullNameExpr(fn[0]),
    fn[1]
  );
}

export function createQualifiedName(fn: FullName): ts.Identifier | ts.QualifiedName {
  if (typeof fn === "string") {
    return ts.factory.createIdentifier(fn);
  }
  return ts.factory.createQualifiedName(
    typeof fn[0] === "string" ? ts.factory.createIdentifier(fn[0]) : createQualifiedName(fn[0]),
    fn[1]
  );
}

/**
 * @example
 * ```
 * import * as foo$bar$baz from "foo/bar/baz";
 * ```
 */
export function createImportAllWithAliastDecl({
  alias,
  module,
}: {
  alias: string;
  module: string;
}): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamespaceImport(ts.factory.createIdentifier(alias))
    ),
    ts.factory.createStringLiteral(module)
  );
}

export function createDslExportConstStmt(name: string, exp: ts.Expression): ts.Statement {
  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(name, undefined, undefined, exp)],
      ts.NodeFlags.Const
    )
  );
}

export function onlyNonNull<T>(): (t: T) => t is NonNullable<T> {
  return (t): t is NonNullable<T> => t != null;
}

export function onlyUnique<T, V>(f?: (t: T) => V): (t: T) => boolean {
  const set = new Set<T | V>();
  return (t) => {
    const key = f ? f(t) : t;

    if (set.has(key)) return false;

    set.add(key);
    return true;
  };
}

export function createProtoToGqlFunc(type: ScalarType): ts.Expression {
  return ts.factory.createPropertyAccessExpression(createTransformerExpr(type), "protoToGql");
}

export function createGqlToProto(type: ScalarType): ts.Expression {
  return ts.factory.createPropertyAccessExpression(createTransformerExpr(type), "gqlToProto");
}

function createTransformerExpr(type: ScalarType): ts.Expression {
  return createProtoNexusCallExpr("getTransformer", [
    ts.factory.createStringLiteral(fullNameString(type.protoFullName!)),
  ]);
}
