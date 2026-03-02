import * as path from "node:path";

import type {
  DescEnum,
  DescExtension,
  DescFile,
  DescMessage,
  DescService,
} from "@bufbuild/protobuf";
import { nestedTypes } from "@bufbuild/protobuf/reflect";
import { safeIdentifier } from "@bufbuild/protoplugin";
import {
  type EnumType,
  filename,
  type InputObjectField,
  type InputObjectType,
  type InterfaceType,
  type ObjectField,
  ObjectOneofField,
  type ObjectType,
  type OneofUnionType,
  type PrinterOptions,
  type SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import {
  code,
  createImportSymbol,
  type ImportSymbol,
  type Printable,
} from "../../codegen/index.js";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;

export function pothosRefName(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): string {
  return `${type.typeName}$Ref`;
}

export function shapeTypeName(type: InputObjectType): string {
  return `${type.typeName}$Shape`;
}

type TypeWithFilename =
  | ObjectType
  | InputObjectType
  | EnumType
  | OneofUnionType
  | SquashedOneofUnionType
  | InterfaceType;

function resolveImportOrLocal(
  field: { parent: TypeWithFilename; type: TypeWithFilename },
  opts: PothosPrinterOptions,
  symbolName: string,
  localPrintable: () => Printable[],
): Printable[] {
  const fromFile = filename(field.parent, opts);
  const toFile = filename(field.type, opts);
  if (fromFile === toFile) return localPrintable();

  const importPath = `./${toFile.replace(/\.ts$/, "")}`;
  return code`${createImportSymbol(symbolName, importPath)}`;
}

export function fieldTypeRefPrintable(
  field:
    | ObjectField<
        ObjectType | EnumType | InterfaceType | SquashedOneofUnionType
      >
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PothosPrinterOptions,
): Printable[] {
  if (field instanceof ObjectOneofField) return pothosRefPrintable(field.type);

  return resolveImportOrLocal(field, opts, pothosRefName(field.type), () =>
    pothosRefPrintable(field.type),
  );
}

export function shapeTypePrintable(type: InputObjectType): Printable[] {
  return code`${shapeTypeName(type)}`;
}

export function fieldTypeShapePrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  return resolveImportOrLocal(field, opts, shapeTypeName(field.type), () =>
    shapeTypePrintable(field.type),
  );
}

export function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

export function toProtoFuncPrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  return resolveImportOrLocal(
    field,
    opts,
    toProtoFuncName(field.type),
    () => code`${toProtoFuncName(field.type)}`,
  );
}

export function pothosRefPrintable(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): Printable[] {
  return code`${pothosRefName(type)}`;
}

export function pothosBuilderPrintable(
  opts: Pick<PothosPrinterOptions, "pothos">,
): Printable[] {
  // protoplugin が自動的に相対パスを計算するため、builderPath をそのまま使用
  return code`${createImportSymbol("builder", opts.pothos.builderPath)}`;
}

export function protoTypeSymbol(
  proto: DescMessage | DescEnum,
  opts: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): ImportSymbol {
  const chunks = [proto.name];
  let current: DescMessage | DescEnum = proto;
  while (current.parent != null) {
    current = current.parent;
    chunks.unshift(current.name);
  }
  const symbolName = chunks.join("_");
  const importPath = protoImportPath(proto, opts);
  return createImportSymbol(symbolName, importPath);
}

/**
 * protobuf-es v2 用: Schema シンボル (例: UserSchema, Parent_ChildSchema) を生成
 *
 * protobuf-es の @bufbuild/protoplugin が行う名前衝突回避ロジックを再実装。
 * 同一ファイル内で shape 名 (型名) と desc 名 (Schema 定数名) が衝突する場合、
 * protobuf-es は salt suffix ($, $1, $2, ...) を付与する。
 */
export function protoSchemaSymbol(
  proto: DescMessage | DescEnum,
  opts: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): ImportSymbol {
  const symbolName = resolveProtobufEsDescName(proto);
  const importPath = protoImportPath(proto, opts);
  return createImportSymbol(symbolName, importPath);
}

function protobufEsSalt(i: number): string {
  if (i === 0) return "";
  if (i === 1) return "$";
  return `$${i - 1}`;
}

function idealShapeName(desc: DescMessage | DescEnum, i: number): string {
  return safeIdentifier(protobufEsIdentifierForNested(desc) + protobufEsSalt(i));
}

type NestedDesc = DescMessage | DescEnum | DescExtension | DescService;

/**
 * protobuf-es と同じ identifier 計算。
 * パッケージ名を除去し、ドット (ネスト区切り) をアンダースコアに置換する。
 */
function protobufEsIdentifierForNested(desc: NestedDesc): string {
  const pkg = desc.file.proto.package;
  const offset = pkg.length > 0 ? pkg.length + 1 : 0;
  return desc.typeName.substring(offset).replace(/\./g, "_");
}

function idealDescName(desc: NestedDesc | DescFile, i: number): string {
  const salt = protobufEsSalt(i);
  if (desc.kind === "file") {
    const name = `file_${desc.name.replace(/[^a-zA-Z0-9_]+/g, "_")}`;
    return safeIdentifier(name + salt);
  }
  if (desc.kind === "enum" || desc.kind === "message") {
    return safeIdentifier(
      protobufEsIdentifierForNested(desc) + "Schema" + salt,
    );
  }
  // extension, service: Schema suffix なし
  return safeIdentifier(protobufEsIdentifierForNested(desc) + salt);
}

// ファイル単位のキャッシュ: 同一ファイル内の複数の型に対して重複計算を避ける
const descNameCache = new WeakMap<
  DescFile,
  Map<DescMessage | DescEnum, string>
>();

/**
 * @bufbuild/protoplugin の allNames() と同じロジックで desc 名を解決する。
 *
 * 1. Pass 1: 全 message/enum の shape 名を登録
 * 2. Pass 2: file desc + 全 nested types の desc 名を登録 (衝突時は salt suffix を付与)
 */
function resolveProtobufEsDescName(proto: DescMessage | DescEnum): string {
  const file = proto.file;

  let cached = descNameCache.get(file);
  if (cached) {
    const name = cached.get(proto);
    if (name !== undefined) return name;
  }

  const taken = new Set<string>();
  const descNames = new Map<DescMessage | DescEnum, string>();

  // Pass 1: shape 名 (message/enum のみ)
  for (const desc of nestedTypes(file)) {
    if (desc.kind !== "enum" && desc.kind !== "message") continue;
    let name: string;
    for (let i = 0; ; i++) {
      name = idealShapeName(desc, i);
      if (!taken.has(name)) break;
    }
    taken.add(name);
  }

  // Pass 2: desc 名 (file + 全 nested types)
  {
    // file descriptor 自体の desc 名を登録
    let fileName: string;
    for (let i = 0; ; i++) {
      fileName = idealDescName(file, i);
      if (!taken.has(fileName)) break;
    }
    taken.add(fileName);
  }

  for (const desc of nestedTypes(file) as Iterable<NestedDesc>) {
    let name: string;
    for (let i = 0; ; i++) {
      name = idealDescName(desc, i);
      if (!taken.has(name)) break;
    }
    taken.add(name);
    if (desc.kind === "message" || desc.kind === "enum") {
      descNames.set(desc, name);
    }
  }

  descNameCache.set(file, descNames);

  const result = descNames.get(proto);
  if (result === undefined) {
    throw new Error(
      `Unable to determine protobuf-es desc name for ${proto.toString()}`,
    );
  }
  return result;
}

/**
 * @bufbuild/protobuf から create 関数を import
 */
export function protobufCreateSymbol(): ImportSymbol {
  return createImportSymbol("create", "@bufbuild/protobuf");
}

/**
 * @bufbuild/protobuf から isMessage 関数を import
 */
export function protobufIsMessageSymbol(): ImportSymbol {
  return createImportSymbol("isMessage", "@bufbuild/protobuf");
}

/**
 * @bufbuild/protobuf から MessageShape 型を import
 */
export function protobufMessageShapeSymbol(): ImportSymbol {
  return createImportSymbol("MessageShape", "@bufbuild/protobuf");
}

/**
 * v2 用: ObjectRef の型パラメータとして使用する型を生成
 * - protobuf-es v2: MessageShape<typeof XxxSchema>
 * - protobuf-es v1: Xxx (クラス)
 * - ts-proto: Xxx (interface)
 */
export function protoRefTypePrintable(
  proto: DescMessage,
  opts: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): Printable[] {
  switch (opts.protobuf) {
    case "ts-proto":
    case "protobuf-es-v1": {
      return code`${protoTypeSymbol(proto, opts)}`;
    }
    case "protobuf-es": {
      return code`${protobufMessageShapeSymbol()}<typeof ${protoSchemaSymbol(proto, opts)}>`;
    }
  }
}

function protoImportPath(
  t: DescMessage | DescEnum,
  o: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): string {
  let importPath: string;
  switch (o.protobuf) {
    case "ts-proto": {
      importPath = t.file.name;
      break;
    }
    case "protobuf-es-v1":
    case "protobuf-es": {
      const { dir, name } = path.parse(t.file.name);
      importPath = `${dir}/${name}_pb`;
      break;
    }
    default: {
      o.protobuf satisfies never;
      throw new Error(`unexpected protobuf option: ${o.protobuf}`);
    }
  }
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`.replace(
    /(?<!:)\/\//,
    "/",
  );
}
