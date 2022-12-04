import {
  EnumType,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  PrinterOptions,
  protoImportPath,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { ProtoEnum, ProtoMessage } from "@proto-graphql/proto-descriptors";
import * as path from "path";
import { code, Code, imp } from "ts-poet";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;

export function pothosRef(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType | InterfaceType
): Code {
  return code`${pothosRefName(type)}`;
}

function pothosRefName(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType | InterfaceType
): string {
  return `${type.typeName}$Ref`;
}

export function shapeType(type: InputObjectType): Code {
  return code`${shapeTypeName(type)}`;
}

export function shapeTypeName(type: InputObjectType): string {
  return `${type.typeName}$Shape`;
}

export function fieldTypeRef(
  field:
    | ObjectField<ObjectType | EnumType | InterfaceType | SquashedOneofUnionType>
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PothosPrinterOptions
): Code {
  const importPath = pbPothosImportPath(field, opts);
  if (importPath == null) return pothosRef(field.type);

  const imported = imp(`IMPORTED_PLACEHOLDER@${importPath}`);
  imported.symbol = pothosRefName(field.type); // NOTE: Workaround for ts-poet not recognizing "$" as an identifier
  return code`${imported}`;
}

export function fieldTypeShape(field: InputObjectField<InputObjectType>, opts: PothosPrinterOptions): Code {
  const importPath = pbPothosImportPath(field, opts);
  if (importPath == null) return shapeType(field.type);

  const imported = imp(`IMPORTED_PLACEHOLDER@${importPath}`);
  imported.symbol = shapeTypeName(field.type); // NOTE: Workaround for ts-poet not recognizing "$" as an identifier
  return code`${imported}`;
}

function pbPothosImportPath(
  field:
    | ObjectField<ObjectType | EnumType | InterfaceType | SquashedOneofUnionType>
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PothosPrinterOptions
): string | null {
  if (field instanceof ObjectOneofField) return null;
  const [fromPath, toPath] = [filename(field.parent, opts), filename(field.type, opts)].map((f) =>
    path.isAbsolute(f) ? `.${path.sep}${f}` : f
  );

  if (fromPath === toPath) return null;

  const importPath = path.relative(path.dirname(fromPath), toPath).replace(/\.ts$/, "");
  return importPath.match(/^[\.\/]/) ? importPath : `./${importPath}`;
}

export function pothosBuilder(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType,
  opts: Pick<PothosPrinterOptions, "pothos" | "fileLayout">
): Code {
  const importPath = opts.pothos.builderPath.startsWith(".")
    ? path.relative(path.dirname(filename(type, opts)), opts.pothos.builderPath)
    : opts.pothos.builderPath;
  return code`${imp(`builder@${importPath}`)}`;
}

export function filename(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType | InterfaceType,
  opts: Pick<PothosPrinterOptions, "fileLayout">
): string {
  switch (opts.fileLayout) {
    case "proto_file":
      return type.file.filename;
    case "graphql_type": {
      return path.join(path.dirname(type.file.filename), `${type.typeName}${type.file.extname}`);
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.fileLayout;
      throw "unreachable";
    }
  }
}

/** Remove nullish values recursively. */
export function compact(v: any): any {
  if (typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(compact);
  if (v == null) return v;
  if ("toCodeString" in v) return v; // ignore nodes of ts-poet
  return compactObj(v);
}

function compactObj<In extends Out, Out extends Record<string, unknown>>(obj: In): Out {
  return Object.keys(obj).reduce((newObj, key) => {
    const v = obj[key];
    return v == null ? newObj : { ...newObj, [key]: compact(v) };
  }, {} as Out);
}

export function protoType(origProto: ProtoMessage | ProtoEnum, opts: PrinterOptions): Code {
  let proto = origProto;
  let name = proto.name;
  while (proto.parent.kind !== "File") {
    proto = proto.parent;
    name = `${proto.name}_${name}`;
  }
  return code`${imp(`${name}@${protoImportPath(proto, opts)}`)}`;
}

export function protoFieldTypeFullName(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): string | undefined {
  if ((field instanceof ObjectField || field instanceof InputObjectField) && field.proto.type !== null) {
    if (field.proto.type.kind === "Scalar") {
      return field.proto.type.type;
    }
    return field.proto.type.fullName.toString();
  }
  return undefined;
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
