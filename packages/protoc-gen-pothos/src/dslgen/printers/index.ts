import type { createRegistry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  type OperationField,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import type { Printable } from "../../codegen/index.js";
import { createEnumTypeCode } from "./enumType.js";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import { createObjectTypeCode } from "./objectType.js";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import { createOperationCode } from "./operationField.js";
import type { PothosPrinterOptions } from "./util.js";

export function createTypeDslPrintables(
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): Printable[][] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return [createObjectTypeCode(type, registry, opts)];
    }
    if (type instanceof InputObjectType) {
      return [createInputObjectTypeCode(type, registry, opts)];
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

export function createOperationDslPrintables(
  operations: readonly OperationField[],
  opts: PothosPrinterOptions,
  runtimeModule: string,
): Printable[][] {
  return operations.map((op) => createOperationCode(op, opts, runtimeModule));
}
