import { createRegistry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { Code } from "ts-poet";

import { createEnumTypeCode } from "./enumType";
import { createInputObjectTypeCode } from "./inputObjectType";
import { createObjectTypeCode } from "./objectType";
import { createOneofUnionTypeCode } from "./oneofUnionType";
import { PothosPrinterOptions } from "./util";

export function createTypeDslCodes(
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): Code[] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return createObjectTypeCode(type, registry, opts);
    }
    if (type instanceof InputObjectType) {
      return createInputObjectTypeCode(type, registry, opts);
    }
    if (type instanceof EnumType) {
      return [createEnumTypeCode(type, registry, opts)];
    }
    if (
      type instanceof OneofUnionType ||
      type instanceof SquashedOneofUnionType
    ) {
      return [createOneofUnionTypeCode(type, registry, opts)];
    }

    const _exhaustiveCheck: never = type;
    throw "unreachable";
  });
}
