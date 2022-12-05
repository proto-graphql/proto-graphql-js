import { ProtoEnum, ProtoMessage } from "@proto-graphql/proto-descriptors";
import * as path from "path";
import { code, Code, imp } from "ts-poet";
import {
  EnumType,
  InputObjectType,
  InterfaceType,
  ObjectType,
  OneofUnionType,
  PrinterOptions,
  protoImportPath,
  SquashedOneofUnionType,
} from "../types";

export function filename(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType | InterfaceType,
  opts: Pick<PrinterOptions, "fileLayout">
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
  switch (opts.protobuf) {
    case "google-protobuf":
    case "protobufjs":
      throw new Error(`not implemented: ${opts.protobuf}`);
    case "ts-proto": {
      let proto = origProto;
      let name = proto.name;
      while (proto.parent.kind !== "File") {
        proto = proto.parent;
        name = `${proto.name}_${name}`;
      }
      return code`${imp(`${name}@${protoImportPath(proto, opts)}`)}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}
