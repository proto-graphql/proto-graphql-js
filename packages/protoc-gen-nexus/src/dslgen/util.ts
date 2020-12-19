import ts from "typescript";
import { ProtoEnum, ProtoFile, ProtoMessage } from "../protoTypes";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

export function protoExportAlias(
  t: ProtoMessage,
  o: { importPrefix?: string }
) {
  return uniqueImportAlias(`${protoImportPath(t, o)}/${gqlTypeName(t)}`);
}

export function protoImportPath(t: ProtoMessage, o: { importPrefix?: string }) {
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${t.importPath}`;
}

export function gqlTypeName(typ: ProtoMessage | ProtoEnum): string {
  return nameWithParent(typ);
}

/**
 * @example
 * ```
 * _$hello$hello_pb.User
 * ```
 */
export function createProtoQualifiedName(
  t: ProtoMessage,
  o: { importPrefix?: string }
): ts.QualifiedName {
  return ts.factory.createQualifiedName(
    t.parent instanceof ProtoFile
      ? ts.factory.createIdentifier(uniqueImportAlias(protoImportPath(t, o)))
      : createProtoQualifiedName(t.parent, o),
    t.name
  );
}

/**
 * @example
 * ```
 * import * as foo$bar$baz from "foo/bar/baz";
 * ```
 */
export function createImportAllWithAliastDecl(
  path: string
): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamespaceImport(
        ts.factory.createIdentifier(uniqueImportAlias(path))
      )
    ),
    ts.factory.createStringLiteral(path)
  );
}

export function createDslExportConstStmt(
  name: string,
  exp: ts.Expression
): ts.Statement {
  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(name, undefined, undefined, exp)],
      ts.NodeFlags.Const
    )
  );
}

function nameWithParent(typ: ProtoMessage | ProtoEnum): string {
  let name = "";
  let t: ProtoMessage | ProtoEnum | ProtoFile = typ;
  for (;;) {
    if (t instanceof ProtoFile) break;
    name = `${t.name}${name}`;
    t = t.parent;
  }
  const prefix = t.descriptor
    .getOptions()
    ?.getExtension(extensions.schema)
    .getTypePrefix();
  if (prefix) {
    name = `${prefix}${name}`;
  }
  return name;
}

export function uniqueImportAlias(path: string) {
  return path
    .replace(/@/g, "$$$$")
    .replace(/\.\.\//g, "__$$")
    .replace(/\.\//g, "_$$")
    .replace(/\//g, "$$")
    .replace(/-/g, "_");
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
