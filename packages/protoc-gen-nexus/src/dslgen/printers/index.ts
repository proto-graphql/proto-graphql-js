import type { Registry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import type { Code } from "ts-poet";

import { createEnumTypeCode } from "./enumType.js";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import { createObjectTypeCode } from "./objectType.js";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { NexusPrinterOptions } from "./util.js";

export function createTypeDslCodes(
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  registry: Registry,
  opts: NexusPrinterOptions,
): Code[] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return createObjectTypeCode(type, registry, opts);
    }
    if (type instanceof InputObjectType) {
      return createInputObjectTypeCode(type, registry, opts);
    }
    if (type instanceof EnumType) {
      return createEnumTypeCode(type, registry);
    }
    if (
      type instanceof OneofUnionType ||
      type instanceof SquashedOneofUnionType
    ) {
      return createOneofUnionTypeCode(type, registry, opts);
    }

    const _exhaustiveCheck: never = type;
    throw "unreachable";
  });
}
