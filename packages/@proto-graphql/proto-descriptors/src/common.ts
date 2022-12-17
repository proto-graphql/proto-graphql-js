import { SourceCodeInfo } from "google-protobuf/google/protobuf/descriptor_pb";

import {
  CommentSet,
  FullName,
  ProtoEnum,
  ProtoEnumValue,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoMethod,
  ProtoOneof,
  ProtoService,
} from "./interfaces";

export class FullNameImpl implements FullName {
  constructor(readonly parent: FullName | null, readonly name: string) {}

  @memo()
  public toString() {
    if (this.parent) {
      return `${this.parent.toString()}.${this.name}`;
    }
    return this.name;
  }
}

export function memo() {
  return function (_target: any, propKey: string, desc: PropertyDescriptor) {
    const origGet = desc.get;
    if (!origGet) return;

    const memoKey = `_memoized_${propKey}`;

    return {
      ...desc,
      get(): any {
        if (memoKey in this) {
          return this[memoKey];
        }
        return (this[memoKey] = origGet.call(this));
      },
    } as PropertyDescriptor & Record<string, unknown>;
  };
}

export function getCommentSetByDescriptors(
  d:
    | ProtoFile
    | ProtoMessage
    | ProtoOneof
    | ProtoField
    | ProtoEnum
    | ProtoEnumValue
): CommentSet {
  const proto = getSourceLocationProto(d);

  return {
    leadingDetachedComments: proto?.getLeadingDetachedCommentsList() ?? [],
    leadingComments: proto?.getLeadingComments() ?? "",
    trailingComments: proto?.getTrailingComments() ?? "",
  };
}

function getSourceLocationProto(
  t:
    | ProtoFile
    | ProtoMessage
    | ProtoOneof
    | ProtoField
    | ProtoEnum
    | ProtoEnumValue
): SourceCodeInfo.Location | null {
  let paths: number[] = [];
  let type = t;

  for (;;) {
    switch (type.kind) {
      case "File": {
        paths = paths.reverse();
        return (
          type.descriptor
            .getSourceCodeInfo()
            ?.getLocationList()
            .find(
              (l) =>
                l.getPathList().length === paths.length &&
                l.getPathList().every((v, i) => v === paths[i])
            ) || null
        );
      }
      case "Message": {
        paths.push(type.index);
        type = type.parent;
        switch (type.kind) {
          case "File":
            paths.push(4); // FileDescriptorProto.message_type
            break;
          case "Message":
            paths.push(3); // DescriptorProto.nested_type
            break;
          /* istanbul ignore next */
          default: {
            const _exhaustiveCheck: never = type;
          }
        }
        break;
      }
      case "Oneof": {
        paths.push(type.index);
        type = type.parent;
        paths.push(8); // DescriptorProto.oneof_decl
        break;
      }
      case "Field": {
        paths.push(type.index);
        type = type.parent;
        paths.push(2); // DescriptorProto.field
        break;
      }
      case "Enum": {
        paths.push(type.index);
        type = type.parent;
        switch (type.kind) {
          case "File":
            paths.push(5); // FileDescriptorProto.enum_type
            break;
          case "Message":
            paths.push(4); // DescriptorProto.enum_type
            break;
          /* istanbul ignore next */
          default: {
            const _exhaustiveCheck: never = type;
            break;
          }
        }
        break;
      }
      case "EnumValue": {
        paths.push(type.index);
        type = type.parent;
        paths.push(2); // EnumDescriptorProto.value
        break;
      }
      /* istanbul ignore next */
      default: {
        const _exhaustiveCheck: never = type;
      }
    }
  }
}

export function isDeprecated(
  proto:
    | ProtoFile
    | ProtoService
    | ProtoMethod
    | ProtoMessage
    | ProtoOneof
    | ProtoField
    | ProtoEnum
    | ProtoEnumValue
): boolean {
  if (proto.kind === "Oneof") {
    return proto.fields.every(isDeprecated);
  }
  return proto.descriptor.getOptions()?.getDeprecated() ?? false;
}
