import type { DescFile } from "@bufbuild/protobuf";
import {
  type EnumType,
  filename,
  filenameFromProtoFile,
  type InputObjectField,
  InputObjectType,
  type InterfaceType,
  jsStringLit,
  type ObjectType,
  type OperationField,
  ScalarType,
  type SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import {
  code,
  createImportSymbol,
  joinCode,
  type Printable,
} from "../../codegen/index.js";
import {
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefName,
  protobufCreateSymbol,
  protoSchemaSymbol,
  protoServiceSymbol,
  toProtoFuncName,
} from "./util.js";

/**
 * Renders a single opted-in unary RPC (an {@link OperationField}) as a
 * `builder.queryField` / `builder.mutationField` definition with a fully
 * implemented resolver, appended to the same `<proto>.pb.pothos.ts` output.
 *
 * See docs/design/grpc-service-to-graphql/design.md §3.2.
 *
 * @example
 * ```ts
 * builder.queryField("getUser", (t) =>
 *   t.field({
 *     type: User$Ref,
 *     nullable: false,
 *     args: { userId: t.arg({ type: "String", required: true }) },
 *     resolve: async (_root, args, ctx) => {
 *       const client = getClient(ctx, UserService);
 *       const res = await callRpc(ctx, (opts) =>
 *         client.getUser(create(GetUserRequestSchema, { userId: args.userId }), opts),
 *       );
 *       return res.user;
 *     },
 *     extensions: { protobufMethod: { ... } },
 *   }),
 * );
 * ```
 */
export function createOperationCode(
  op: OperationField,
  opts: PothosPrinterOptions,
  runtimeModule: string,
): Printable[] {
  const file = op.service.file;
  const builderMethod = op.kind === "query" ? "queryField" : "mutationField";

  const { typeExpr, nullabilityExpr } = returnTypePrintable(op, file, opts);
  const args = argsPrintable(op, file, opts);
  const argsEntry = args != null ? code`\n      args: ${args},` : "";
  const deprecationEntry =
    op.deprecationReason != null
      ? code`\n      deprecationReason: ${jsStringLit(op.deprecationReason)},`
      : "";

  return code`
    ${pothosBuilderPrintable(opts)}.${builderMethod}(${jsStringLit(op.name)}, (t) =>
      t.field({
        type: ${typeExpr},
        nullable: ${nullabilityExpr},${argsEntry}
        resolve: ${resolvePrintable(op, file, opts, runtimeModule)},
        extensions: ${protobufMethodExtensions(op)},${deprecationEntry}
      }),
    );
  `;
}

type RefableType =
  | ObjectType
  | EnumType
  | InputObjectType
  | InterfaceType
  | SquashedOneofUnionType;

/**
 * Resolves a `Xxx$Ref` for `type` relative to the emitting service file: a
 * local identifier when the type is generated into the same file, otherwise an
 * import from that file. Unlike {@link resolveImportOrLocal} in `util.ts`, the
 * "same file" decision is made against the *emit* file (the service's file),
 * not against a field's parent type — an operation and its return/argument
 * types can live in different proto files.
 */
function typeRefRelativeToFile(
  type: RefableType,
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] {
  const name = pothosRefName(type);
  const toFile = filename(type, opts);
  if (filenameFromProtoFile(file, opts) === toFile) return code`${name}`;
  return code`${createImportSymbol(name, `./${toFile.replace(/\.ts$/, "")}`)}`;
}

/** Same as {@link typeRefRelativeToFile}, but for an Input type's `$toProto`. */
function toProtoFuncRelativeToFile(
  type: InputObjectType,
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] {
  const name = toProtoFuncName(type);
  const toFile = filename(type, opts);
  if (filenameFromProtoFile(file, opts) === toFile) return code`${name}`;
  return code`${createImportSymbol(name, `./${toFile.replace(/\.ts$/, "")}`)}`;
}

function returnTypePrintable(
  op: OperationField,
  file: DescFile,
  opts: PothosPrinterOptions,
): { typeExpr: Printable[]; nullabilityExpr: string } {
  const rt = op.returnType;
  if (rt.kind === "boolean") {
    return { typeExpr: code`"Boolean"`, nullabilityExpr: String(op.nullable) };
  }
  if (rt.kind === "object") {
    return {
      typeExpr: typeRefRelativeToFile(rt.type, file, opts),
      nullabilityExpr: String(op.nullable),
    };
  }

  // exposeField: mirror how field.ts renders an output field's type.
  const field = rt.field;
  const base =
    field.type instanceof ScalarType
      ? code`${jsStringLit(field.type.typeName)}`
      : typeRefRelativeToFile(field.type, file, opts);
  const typeExpr = field.isList() ? code`[${base}]` : base;
  const nullabilityExpr = field.isList()
    ? `{ list: ${String(op.nullable)}, items: false }`
    : String(op.nullable);
  return { typeExpr, nullabilityExpr };
}

function argsPrintable(
  op: OperationField,
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] | null {
  const a = op.args;
  if (a.kind === "none") return null;

  if (a.kind === "input") {
    return code`{ input: t.arg({ type: ${typeRefRelativeToFile(
      a.type,
      file,
      opts,
    )}, required: true }) }`;
  }

  if (a.args.length === 0) return null;
  const entries = a.args.map(
    (f) => code`${f.name}: ${argPrintable(f, file, opts)}`,
  );
  return code`{ ${joinCode(entries, ", ")} }`;
}

function argPrintable(
  field: InputObjectField<ScalarType | EnumType | InputObjectType>,
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] {
  const base =
    field.type instanceof ScalarType
      ? code`${jsStringLit(field.type.typeName)}`
      : typeRefRelativeToFile(field.type, file, opts);
  const typeExpr = field.isList() ? code`[${base}]` : base;
  // Mirror the `required` shape used for input fields in field.ts: a list arg
  // carries `{ list, items }`, with items always required (non-null).
  const required = field.isList()
    ? `{ list: ${String(!field.isNullable())}, items: true }`
    : String(!field.isNullable());
  return code`t.arg({ type: ${typeExpr}, required: ${required} })`;
}

function resolvePrintable(
  op: OperationField,
  file: DescFile,
  opts: PothosPrinterOptions,
  runtimeModule: string,
): Printable[] {
  const getClientSym = createImportSymbol("getClient", runtimeModule);
  const callRpcSym = createImportSymbol("callRpc", `${runtimeModule}/graphql`);
  const serviceSym = protoServiceSymbol(op.service, opts);
  // The resolver only reads `args` when the request is built from them: a
  // single `input` arg or a non-empty flattened request. An Empty request
  // (`none`) or a zero-field flatten leaves `args` unused, so name it `_args`.
  const referencesArgs =
    op.args.kind === "input" ||
    (op.args.kind === "flatten" && op.args.args.length > 0);
  const argsParam = referencesArgs ? "args" : "_args";

  const call = code`${callRpcSym}(ctx, (opts) => client.${op.method.localName}(${requestPrintable(
    op,
    file,
    opts,
  )}, opts))`;

  if (op.returnType.kind === "boolean") {
    // The RPC still runs; the (Empty) response is discarded and the field is
    // a literal `true` (R5.5).
    return code`async (_root, ${argsParam}, ctx) => {
      const client = ${getClientSym}(ctx, ${serviceSym});
      await ${call};
      return true;
    }`;
  }

  const returnExpr =
    op.returnType.kind === "exposeField"
      ? code`res.${tsFieldName(op.returnType.field.proto, opts)}`
      : code`res`;
  return code`async (_root, ${argsParam}, ctx) => {
      const client = ${getClientSym}(ctx, ${serviceSym});
      const res = await ${call};
      return ${returnExpr};
    }`;
}

function requestPrintable(
  op: OperationField,
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] {
  const a = op.args;
  const createSym = protobufCreateSymbol();

  if (a.kind === "none") {
    // Empty request -> zero-argument `create(EmptySchema)` (R5.5).
    return code`${createSym}(${createImportSymbol(
      "EmptySchema",
      "@bufbuild/protobuf/wkt",
    )})`;
  }

  if (a.kind === "input") {
    // Mutation: reuse the request's own Input converter (guaranteed generated
    // by S1-C's mutation arg resolution).
    return code`${toProtoFuncRelativeToFile(a.type, file, opts)}(args.input)`;
  }

  // Query flatten: assemble the request inline, mirroring the field-assembly
  // that inputObjectType.ts's `$toProto` emits (so oneof reconstruction and
  // message-field conversion stay identical), sourced from `args.*`.
  return code`${createSym}(${protoSchemaSymbol(op.method.input, opts)}, {
        ${requestAssembly(a.args, file, opts)}
      })`;
}

function requestAssembly(
  fields: readonly InputObjectField<ScalarType | EnumType | InputObjectType>[],
  file: DescFile,
  opts: PothosPrinterOptions,
): Printable[] {
  // Group message-typed oneof members by their oneof, exactly as
  // inputObjectType.ts does. Non-message oneof members are intentionally not
  // assembled here (same as `$toProto`): v1 emits no oneof reconstruction for
  // them (decision-log §5 open item).
  const oneofGroups = new Map<string, InputObjectField<InputObjectType>[]>();
  for (const f of fields) {
    if (f.proto.oneof == null) continue;
    if (!(f.type instanceof InputObjectType)) continue;
    const group = oneofGroups.get(f.proto.oneof.name) ?? [];
    group.push(f as InputObjectField<InputObjectType>);
    oneofGroups.set(f.proto.oneof.name, group);
  }

  const plainAssignments = fields
    .filter((f) => f.proto.oneof == null)
    .map((f) => {
      const localName = tsFieldName(f.proto, opts).toString();
      if (f.type instanceof InputObjectType) {
        const toProto = toProtoFuncRelativeToFile(f.type, file, opts);
        if (f.isList()) {
          return code`${localName}: args.${f.name}?.map((v) => ${toProto}(v)),`;
        }
        return code`${localName}: args.${f.name} ? ${toProto}(args.${f.name}) : undefined,`;
      }
      // ScalarType | EnumType pass through.
      return code`${localName}: args.${f.name} ?? undefined,`;
    });

  const oneofAssignments = [...oneofGroups.values()].map((members) => {
    const oneofName = tsFieldName(
      // biome-ignore lint/style/noNonNullAssertion: grouped members always have a oneof
      members[0]!.proto.oneof!,
      opts,
    ).toString();
    const cases = members.map((f) => {
      const caseName = tsFieldName(f.proto, opts).toString();
      const toProto = toProtoFuncRelativeToFile(f.type, file, opts);
      return code`args.${f.name} ? { case: ${jsStringLit(caseName)}, value: ${toProto}(args.${f.name}) } :`;
    });
    return code`${oneofName}: ${joinCode(cases, " ")} undefined,`;
  });

  return joinCode([...plainAssignments, ...oneofAssignments], "\n");
}

/**
 * Hand-built `extensions: { protobufMethod: {...} }` block, mirroring how
 * codegen-core's `protobufGraphQLExtensions` emits `protobufMessage`. Kept
 * local (rather than added to codegen-core) since it is trivial and needs no
 * registry-based option serialization.
 */
function protobufMethodExtensions(op: OperationField): Printable[] {
  const { method, service } = op;
  const pkg = service.file.proto.package ?? "";
  const fullName = `${service.typeName}.${method.name}`;
  return code`{ protobufMethod: { name: ${jsStringLit(
    method.name,
  )}, fullName: ${jsStringLit(fullName)}, service: ${jsStringLit(
    service.typeName,
  )}, package: ${jsStringLit(pkg)} } }`;
}
