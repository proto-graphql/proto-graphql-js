import path from "path";
import ts from "typescript";
import { constantCase, pascalCase } from "change-case";
import {
  ProtoEnum,
  ProtoEnumValue,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoOneof,
} from "../protoTypes";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { GenerationParams } from "./types";
import { ExtensionFieldInfo } from "google-protobuf";

export function protoExportAlias(
  t: ProtoMessage | ProtoOneof,
  o: GenerationParams
): string {
  if (t instanceof ProtoOneof) {
    return uniqueImportAlias(`${protoExportAlias(t.parent, o)}.${t.name}`);
  }
  const chunks = [protoImportPath(t, o)];
  if (o.useProtobufjs) {
    chunks.push(...t.file.package.split("."));
  }
  chunks.push(nameWithParent(t));
  return uniqueImportAlias(chunks.join("/"));
}

export function protoImportPath(
  t: ProtoMessage | ProtoEnum,
  o: GenerationParams
) {
  const importPath = o.useProtobufjs
    ? path.dirname(t.file.name)
    : t.file.importPath;
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`;
}

export function gqlTypeName(
  typ: ProtoMessage | ProtoOneof | ProtoEnum,
  opts?: { input?: boolean }
): string {
  const name = nameWithParent(typ);
  const suffix = typ instanceof ProtoMessage && opts?.input ? "Input" : "";
  return name + suffix;
}

export function createDeprecationPropertyAssignment(
  t: ProtoField | ProtoEnumValue | ProtoOneof
): ts.PropertyAssignment | null {
  const reason = t.deprecationReason;
  if (!reason) return null;

  if (reason instanceof ProtoFile) {
    return ts.factory.createPropertyAssignment(
      "deprecation",
      ts.factory.createStringLiteral(`${reason.name} is mark as deprecated.`)
    );
  }

  let reasonName: string;

  if ("qualifiedName" in reason) {
    reasonName = reason.qualifiedName;
  } else if (reason instanceof ProtoField) {
    reasonName = `${reason.parent.qualifiedName}.${reason.name}`;
  } else if (reason instanceof ProtoOneof) {
    reasonName = `${reason.parent.qualifiedName}.${reason.name}`;
  } else if (reason instanceof ProtoEnumValue) {
    reasonName = `${reason.parent.qualifiedName}.${reason.name}`;
  } else {
    const _exhaustiveCheck: never = reason;
    throw "unreachable";
  }

  const msg = `${reasonName} is mark as deprecated in a *.proto file.`;

  return ts.factory.createPropertyAssignment(
    "deprecation",
    ts.factory.createStringLiteral(msg)
  );
}

export function isIgnoredType(
  type: ProtoMessage | ProtoEnum,
  opts?: { input: boolean }
): boolean {
  let ext: ExtensionFieldInfo<{ getIgnore(): boolean }>;
  if (type.parent instanceof ProtoMessage && isIgnoredType(type.parent)) {
    return true;
  }
  if (type instanceof ProtoMessage) {
    if (opts?.input) {
      if (isIgnoredType(type)) return true;
      ext = extensions.inputType;
    } else {
      ext = extensions.objectType;
    }
  } else if (type instanceof ProtoEnum) {
    ext = extensions.enumType;
  } else {
    const _exhaustiveCheck: never = type;
    throw "unreachable";
  }
  return type.descriptor.getOptions()?.getExtension(ext)?.getIgnore() ?? false;
}

export function isRequiredField(field: ProtoField | ProtoOneof): boolean {
  if (
    field instanceof ProtoField &&
    (field.descriptor.getLabel() ===
      FieldDescriptorProto.Label.LABEL_REQUIRED ||
      (field.descriptor.getType() !== FieldDescriptorProto.Type.TYPE_MESSAGE &&
        field.descriptor.getType() !== FieldDescriptorProto.Type.TYPE_ENUM))
  ) {
    return true;
  }
  return extractBehaviorComments(field).includes("Required");
}

export function isOutputOnlyField(field: ProtoField | ProtoOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Output only");
}

export function isInputOnlyField(field: ProtoField | ProtoOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Input only");
}

export function isIgnoredField(
  field: ProtoField | ProtoEnumValue | ProtoOneof,
  opts?: { input: boolean }
): boolean {
  let ext: ExtensionFieldInfo<{ getIgnore(): boolean }>;
  if (field instanceof ProtoField) {
    if (
      (field.type instanceof ProtoMessage || field.type instanceof ProtoEnum) &&
      isIgnoredType(field.type, opts)
    ) {
      return true;
    }
    const oneof = field.containingOneof();
    if (oneof && isIgnoredField(oneof)) {
      return true;
    }
    ext = extensions.field;
  } else if (field instanceof ProtoEnumValue) {
    ext = extensions.enumValue;
  } else if (field instanceof ProtoOneof) {
    ext = extensions.oneof;
  } else {
    const _exhaustiveCheck: never = field;
    throw "unreachable";
  }
  return field.descriptor.getOptions()?.getExtension(ext)?.getIgnore() ?? false;
}

const behaviorComments = ["Required", "Input only", "Output only"] as const;

function extractBehaviorComments(
  field: ProtoField | ProtoOneof
): typeof behaviorComments[number][] {
  return (field.comments.leadingComments ?? "")
    .split(/\.\s+/, 3)
    .slice(0, 2)
    .map((c) => c.replace(/\.\s*$/, ""))
    .filter((c): c is typeof behaviorComments[number] =>
      behaviorComments.includes(c as any)
    );
}

export function getEnumValueForUnspecified(
  en: ProtoEnum
): ProtoEnumValue | null {
  return (
    en.values.find(
      (ev) =>
        ev.index === 0 &&
        ev.name === `${constantCase(ev.parent.name)}_UNSPECIFIED`
    ) ?? null
  );
}

export function isEnumValueForUnspecified(ev: ProtoEnumValue): boolean {
  return (
    ev.index === 0 && ev.name === `${constantCase(ev.parent.name)}_UNSPECIFIED`
  );
}

/**
 * @example
 * ```
 * _$hello$hello_pb.User
 * ```
 */
export function createProtoExpr(
  t: ProtoMessage | ProtoEnum,
  o: GenerationParams
): ts.Expression {
  const buildExpr = ([left, name]: Selector): ts.Expression => {
    return ts.factory.createPropertyAccessExpression(
      typeof left === "string"
        ? ts.factory.createIdentifier(left)
        : buildExpr(left),
      name
    );
  };
  return buildExpr(createProtoFullName(t, o));
}

/**
 * @example js_out
 * ```
 * _$hello$hello_pb.User
 * ```
 *
 * @example protobufjs
 * ```
 * _$hello.hello.User
 * ```
 */
export function createProtoQualifiedName(
  t: ProtoMessage,
  o: GenerationParams
): ts.QualifiedName {
  const buildExpr = ([left, name]: Selector): ts.QualifiedName => {
    return ts.factory.createQualifiedName(
      typeof left === "string"
        ? ts.factory.createIdentifier(left)
        : buildExpr(left),
      name
    );
  };
  return buildExpr(createProtoFullName(t, o));
}

/**
 * @example js_out
 * ```
 * ["_$hello$hello_pb", "User"]
 * ```
 *
 * @example protobufjs
 * ```
 * [["_$hello", "hello"], "User"]
 * ```
 */
function createProtoFullName(
  t: ProtoMessage | ProtoEnum,
  o: GenerationParams,
  isLeft = false
): Selector {
  let left: Selector[0];
  if (t.parent instanceof ProtoFile) {
    if (o.useProtobufjs) {
      const pkgs = t.parent.package.split(".");
      left = pkgs.reduce<typeof left>(
        (n, pkg) => [n, pkg],
        uniqueImportAlias(protoImportPath(t, o))
      );
    } else {
      left = uniqueImportAlias(protoImportPath(t, o));
    }
  } else {
    left = createProtoFullName(t.parent, o, true);
  }
  let name = t.name;
  if (!isLeft && t instanceof ProtoMessage && o.useProtobufjs) {
    name = `I${name}`;
  }
  return [left, name];
}

type Selector = [Selector | string, string];

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

function nameWithParent(typ: ProtoMessage | ProtoOneof | ProtoEnum): string {
  let name = "";
  let t: ProtoMessage | ProtoOneof | ProtoEnum | ProtoFile = typ;
  for (;;) {
    if (t instanceof ProtoFile) break;
    name = `${t instanceof ProtoOneof ? pascalCase(t.name) : t.name}${name}`;
    t = t.parent;
  }
  const prefix = t.descriptor
    .getOptions()
    ?.getExtension(extensions.schema)
    ?.getTypePrefix();
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
    .replace(/\./g, "_")
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
