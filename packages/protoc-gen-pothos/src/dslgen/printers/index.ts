import type { createRegistry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import type { GeneratedFile } from "@bufbuild/protoplugin";
import { printEnumTypeCode } from "./enumType.js";
import { printInputObjectTypeCode } from "./inputObjectType.js";
import { printObjectTypeCode } from "./objectType.js";
import { printOneofUnionTypeCode } from "./oneofUnionType.js";
import type { PothosPrinterOptions } from "./util.js";

export function printTypeDslCodes(
  g: GeneratedFile,
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): void {
  for (const t of types) {
    g.print();
    switch (true) {
      case t instanceof ObjectType: {
        printObjectTypeCode(g, t, registry, opts);
        break;
      }
      case t instanceof InputObjectType: {
        printInputObjectTypeCode(g, t, registry, opts);
        break;
      }
      case t instanceof EnumType: {
        printEnumTypeCode(g, t, registry, opts);
        break;
      }
      case t instanceof OneofUnionType:
      case t instanceof SquashedOneofUnionType: {
        printOneofUnionTypeCode(g, t, registry, opts);
        break;
      }
      default: {
        t satisfies never;
        throw "unreachable";
      }
    }
  }
}
