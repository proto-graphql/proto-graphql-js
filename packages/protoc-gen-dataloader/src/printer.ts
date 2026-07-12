import type { DescFile } from "@bufbuild/protobuf";
import {
  createImportSymbol,
  type GeneratedFile,
  type Printable,
  type Schema,
} from "@bufbuild/protoplugin";
import {
  type BatchSpec,
  filenameFromProtoFile,
  jsStringLit,
  resolveBatchSpec,
} from "@proto-graphql/codegen-core";
import type { DataloaderOptions } from "@proto-graphql/protoc-plugin-helpers";

import {
  protobufEsImportPath,
  schemaConstName,
  serviceConstName,
} from "./esImport.js";

/**
 * Generates `<proto path><filename_suffix>` for `file`, but only when at
 * least one of its services declares `(graphql.rpc).batch` (design.md §4.1).
 * Returns the "<service>.<method>: <error>" diagnostics for every method
 * whose batch declaration failed validation (`resolveBatchSpec` returning
 * `{ ok: false }`); the caller (plugin.ts) accumulates these across every
 * file in the request and fails the whole run if any exist, since a single
 * `CodeGeneratorResponse` can't report a partial success (design.md §4.2).
 */
export function generateFiles(
  schema: Schema<DataloaderOptions>,
  file: DescFile,
  opts: DataloaderOptions,
): string[] {
  const specs: BatchSpec[] = [];
  const errors: string[] = [];

  for (const service of file.services) {
    for (const method of service.methods) {
      const result = resolveBatchSpec(method);
      if (result == null) continue; // no `(graphql.rpc).batch` on this method

      if (result.ok) {
        specs.push(result.spec);
      } else {
        const rpcRef = `${method.parent.name}.${method.name}`;
        for (const e of result.errors) {
          errors.push(`${rpcRef}: ${e}`);
        }
      }
    }
  }

  if (specs.length === 0) return errors;

  const f = schema.generateFile(filenameFromProtoFile(file, opts));
  f.preamble(file);

  // `dataloader`'s types are declared via `export = DataLoader` (a CJS
  // export assignment merging the class with a same-named namespace for
  // `DataLoader.Options` etc. — see node_modules/dataloader/index.d.ts), so
  // there is no ES named export for `createImportSymbol` to bind: only a
  // default import (`import DataLoader from "dataloader"`, resolved via
  // `esModuleInterop`) works. `createImportSymbol` can only ever print a
  // named `import { X } from "…"` (see @bufbuild/protoplugin's
  // generated-file.js), so this one import is written by hand instead of
  // through the symbol system; `printLoader` below refers to the type via
  // the plain "DataLoader" string rather than an ImportSymbol.
  f.print('import type DataLoader from "dataloader";');
  f.print();

  for (const spec of specs) {
    printLoader(f, spec, opts);
    f.print();
  }

  return errors;
}

function printLoader(
  f: GeneratedFile,
  spec: BatchSpec,
  opts: DataloaderOptions,
): void {
  const method = spec.method;
  const service = method.parent;
  const entity = spec.entityMessage;

  const ctxType = createImportSymbol(
    "ProtoGraphqlConnectContext",
    opts.runtimeModule,
    true,
  );
  const createRpcLoaderSym = createImportSymbol(
    "createRpcLoader",
    opts.runtimeModule,
  );
  const createSym = createImportSymbol("create", "@bufbuild/protobuf");
  const messageShapeType = createImportSymbol(
    "MessageShape",
    "@bufbuild/protobuf",
    true,
  );
  const serviceSym = createImportSymbol(
    serviceConstName(service),
    protobufEsImportPath(service.file, opts.importPrefix),
  );
  const reqSchemaSym = createImportSymbol(
    schemaConstName(method.input),
    protobufEsImportPath(method.input.file, opts.importPrefix),
  );
  const entitySchemaSym = createImportSymbol(
    schemaConstName(entity),
    protobufEsImportPath(entity.file, opts.importPrefix),
  );

  const entityShape: Printable[] = [
    messageShapeType,
    "<typeof ",
    entitySchemaSym,
    ">",
  ];
  const valueType: Printable[] = spec.group
    ? [entityShape, "[]"]
    : [entityShape, " | null"];

  const loaderName = `${method.localName}Loader`;
  const hasParams = spec.paramFields.length > 0;
  const paramsTypeName = `${upperFirst(method.localName)}LoaderParams`;

  const parts: Printable[] = [];

  if (hasParams) {
    const reqInitShapeType = createImportSymbol(
      "MessageInitShape",
      "@bufbuild/protobuf",
      true,
    );
    // Intentionally the *full* request init shape (including keyField), not
    // `Omit<..., keyField>` as design.md §4.5 illustrates: `MessageInitShape`
    // resolves to a `Req | { $typeName?: never; ...fields }` union (see
    // @bufbuild/protobuf's `MessageInit<T>`), and `Omit`/`Pick` do not
    // distribute over unions. Omitting a key from that union collapses it
    // into a single object type whose `$typeName` becomes
    // `<literal> | undefined` instead of always-`undefined`, which is no
    // longer assignable to connect-runtime's `RpcLoaderAccessor` /
    // `GroupRpcLoaderAccessor` params type (confirmed by the golden
    // typecheck — see the M2 report). Passing keyField through `params` is
    // harmless: `call` below always overwrites it with the batch's keys.
    parts.push(
      "export type ",
      paramsTypeName,
      " = ",
      reqInitShapeType,
      "<typeof ",
      reqSchemaSym,
      ">;\n\n",
    );
  }

  // Every exported loader gets an explicit function-type annotation (no
  // casts): `(ctx) => DataLoader<K,V>` / `(ctx, params?: P) => ...` /
  // `(ctx, params: P) => ...`, per the confirmed connect-runtime contract
  // (`createRpcLoader`'s inferred return type is otherwise too specific to
  // narrow cleanly at the call site — see the D3 report).
  parts.push("export const ", loaderName, ": (ctx: ", ctxType);
  if (hasParams) {
    parts.push(
      ", params",
      spec.paramsRequired ? "" : "?",
      ": ",
      paramsTypeName,
    );
  }
  parts.push(") => DataLoader<", spec.keyTsType, ", ", valueType);
  parts.push("> = ", createRpcLoaderSym, "({\n");
  parts.push("  service: ", serviceSym, ",\n");
  parts.push("  method: ", jsStringLit(method.localName), ",\n");
  parts.push("  requestSchema: ", reqSchemaSym, ",\n");
  parts.push(
    "  call: (client, keys, params, opts) => client.",
    method.localName,
    "(",
    createSym,
    "(",
    reqSchemaSym,
    ", { ...params, ",
    spec.keyField.localName,
    ": [...keys] }), opts),\n",
  );
  parts.push(
    "  extractEntities: (res) => res.",
    spec.entityField.localName,
    ",\n",
  );

  const entityParamName = lowerFirst(entity.name);
  parts.push(
    "  extractKey: (",
    entityParamName,
    ": ",
    entityShape,
    ") => ",
    entityParamName,
    ".",
    spec.entityKeyField.localName,
    ",\n",
  );

  if (spec.group) {
    parts.push("  group: true,\n");
  }
  if (spec.maxBatchSize != null) {
    parts.push("  maxBatchSize: ", spec.maxBatchSize, ",\n");
  }
  parts.push("});");

  f.print(...parts);
}

function upperFirst(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

function lowerFirst(s: string): string {
  return s.length === 0 ? s : s[0].toLowerCase() + s.slice(1);
}
