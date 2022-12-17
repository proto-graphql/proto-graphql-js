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
import { NexusPrinterOptions } from "./util";

export function createTypeDslCodes(
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  opts: NexusPrinterOptions
): Code[] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return createObjectTypeCode(type, opts);
    }
    if (type instanceof InputObjectType) {
      return createInputObjectTypeCode(type, opts);
    }
    if (type instanceof EnumType) {
      return createEnumTypeCode(type);
    }
    if (
      type instanceof OneofUnionType ||
      type instanceof SquashedOneofUnionType
    ) {
      return createOneofUnionTypeCode(type, opts);
    }

    const _exhaustiveCheck: never = type;
    throw "unreachable";
  });
}
