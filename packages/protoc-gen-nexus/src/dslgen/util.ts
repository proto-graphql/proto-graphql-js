import ts from "typescript";
import { ProtoEnum, ProtoFile, ProtoMessage } from "../protoTypes";

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
    if (t instanceof ProtoMessage || t instanceof ProtoEnum) {
      name = `${t.name}${name}`;
      t = t.parent;
    } else {
      break;
    }
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

export function compact<T>(input: T[]): NonNullable<T>[] {
  return input.filter((v): v is NonNullable<T> => v != null);
}

export function uniq<T, V>(input: T[], f?: (t: T) => V) {
  const out = [] as T[];
  const set = new Set<T | V>();

  for (const v of input) {
    const key = f ? f(v) : v;
    if (!set.has(key)) {
      set.add(key);
      out.push(v);
    }
  }

  return out;
}
