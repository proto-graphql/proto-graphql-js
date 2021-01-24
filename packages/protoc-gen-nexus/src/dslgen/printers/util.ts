import ts from "typescript";
import {
  EnumType,
  EnumTypeValue,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
  FullName,
  ObjectOneofField,
} from "../types";

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

export function fullNameString([left, name]: FullName): string {
  return `${typeof left === "string" ? left : fullNameString(left)}.${name}`;
}

export function createFullNameExpr([left, name]: FullName): ts.Expression {
  return ts.factory.createPropertyAccessExpression(
    typeof left === "string" ? ts.factory.createIdentifier(left) : createFullNameExpr(left),
    name
  );
}

export function createQualifiedName([left, name]: FullName): ts.QualifiedName {
  return ts.factory.createQualifiedName(
    typeof left === "string" ? ts.factory.createIdentifier(left) : createQualifiedName(left),
    name
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
