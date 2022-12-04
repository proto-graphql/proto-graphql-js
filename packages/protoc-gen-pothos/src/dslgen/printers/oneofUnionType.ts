import { OneofUnionType, SquashedOneofUnionType } from "@proto-graphql/codegen-core";
import { code, Code, literalOf } from "ts-poet";
import { compact, pothosBuilder, PothosPrinterOptions, pothosRef, protoFieldTypeFullName } from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = builder.unionType("Oneof", {
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeCode(
  type: OneofUnionType | SquashedOneofUnionType,
  opts: PothosPrinterOptions
): Code {
  const typeOpts = {
    types: type.fields.map((f) => pothosRef(f.type)),
    description: type.description,
    extensions: {
      protobufOneof: {
        fullName: type.proto.fullName.toString(),
        name: type.proto.name,
        messageName: type.proto.kind === "Oneof" ? type.proto.parent.name : undefined,
        package: (type.proto.kind === "Message" ? type.proto : type.proto.parent).file.package,
        fields: type.fields.map((f) => ({
          name: f.proto.name,
          type: protoFieldTypeFullName(f),
        })),
      },
    },
  };
  return code`
    export const ${pothosRef(type)} =
      ${pothosBuilder(type, opts)}.unionType(${literalOf(type.typeName)}, ${literalOf(compact(typeOpts))});
  `;
}
