import {
  EnumType,
  EnumTypeValue,
  FullName,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import ts from "typescript";

/**
 * @example
 * ```
 * nexus.objectType(...)
 * ```
 */
export function createBuilderCallExpr(name: string, args: readonly ts.Expression[]): ts.Expression {
  return ts.factory.createCallExpression(createBuilderPropExpr(name), undefined, args);
}

/**
 * @example
 * ```
 * builder.objectRef
 * ```
 */
export function createBuilderPropExpr(name: string): ts.Expression {
  return ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("builder"), name);
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
export function createImportDecl({
  alias,
  module,
  type,
}: {
  alias: string;
  module: string;
  type: "namespace" | "named";
}): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      type === "namespace"
        ? ts.factory.createNamespaceImport(ts.factory.createIdentifier(alias))
        : type === "named"
        ? ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(alias)),
          ])
        : undefined
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
