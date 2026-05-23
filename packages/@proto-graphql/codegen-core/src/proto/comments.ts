import {
  type DescEnum,
  type DescEnumValue,
  type DescField,
  type DescFile,
  type DescMessage,
  type DescOneof,
  isFieldSet,
} from "@bufbuild/protobuf";
import {
  DescriptorProtoSchema,
  EnumDescriptorProtoSchema,
  FileDescriptorProtoSchema,
  type SourceCodeInfo_Location,
  SourceCodeInfo_LocationSchema,
} from "@bufbuild/protobuf/wkt";

/**
 * A descriptor for which we surface source-level comments. This intentionally
 * excludes file/service/rpc/extension because codegen-core never queries
 * comments on them.
 */
export type CommentedDesc =
  | DescMessage
  | DescField
  | DescEnum
  | DescEnumValue
  | DescOneof;

export interface Comments {
  leading: string | undefined;
  trailing: string | undefined;
  leadingDetached: string[];
}

const EMPTY: Comments = Object.freeze({
  leading: undefined,
  trailing: undefined,
  leadingDetached: Object.freeze<string[]>([]) as string[],
});

const indexByFile = new WeakMap<
  DescFile,
  Map<CommentedDesc, SourceCodeInfo_Location>
>();

/**
 * Drop-in replacement for `@bufbuild/protoplugin`'s `getComments`, but with
 * O(N) total cost per file instead of O(N²): we walk `sourceCodeInfo.location`
 * once per `DescFile` to build a `desc → location` map, then answer all
 * subsequent lookups in O(1) via a `WeakMap` cache.
 */
export function getCommentsFor(desc: CommentedDesc): Comments {
  const file = fileOf(desc);
  const loc = ensureIndex(file).get(desc);
  if (!loc) return EMPTY;
  return {
    leading: isFieldSet(loc, SourceCodeInfo_LocationSchema.field.leadingComments)
      ? loc.leadingComments
      : undefined,
    trailing: isFieldSet(
      loc,
      SourceCodeInfo_LocationSchema.field.trailingComments,
    )
      ? loc.trailingComments
      : undefined,
    leadingDetached: loc.leadingDetachedComments,
  };
}

function fileOf(desc: CommentedDesc): DescFile {
  switch (desc.kind) {
    case "message":
    case "enum":
      return desc.file;
    case "field":
    case "oneof":
      return desc.parent.file;
    case "enum_value":
      return desc.parent.file;
  }
}

function ensureIndex(
  file: DescFile,
): Map<CommentedDesc, SourceCodeInfo_Location> {
  const cached = indexByFile.get(file);
  if (cached) return cached;
  const built = buildIndex(file);
  indexByFile.set(file, built);
  return built;
}

function buildIndex(
  file: DescFile,
): Map<CommentedDesc, SourceCodeInfo_Location> {
  const map = new Map<CommentedDesc, SourceCodeInfo_Location>();
  const sci = file.proto.sourceCodeInfo;
  if (!sci) return map;
  for (const loc of sci.location) {
    const desc = resolveByPath(file, loc.path);
    // Paths that point at sub-fields of a descriptor (e.g. the `type` field of
    // a FieldDescriptorProto) resolve to `undefined`; ignore those silently.
    if (desc) map.set(desc, loc);
  }
  return map;
}

// FileDescriptorProto path roots we recognise.
const FILE_MESSAGE_TYPE = FileDescriptorProtoSchema.field.messageType.number;
const FILE_ENUM_TYPE = FileDescriptorProtoSchema.field.enumType.number;

// DescriptorProto sub-paths we recognise.
const MSG_FIELD = DescriptorProtoSchema.field.field.number;
const MSG_NESTED_TYPE = DescriptorProtoSchema.field.nestedType.number;
const MSG_ENUM_TYPE = DescriptorProtoSchema.field.enumType.number;
const MSG_ONEOF_DECL = DescriptorProtoSchema.field.oneofDecl.number;

// EnumDescriptorProto sub-paths we recognise.
const ENUM_VALUE = EnumDescriptorProtoSchema.field.value.number;

function resolveByPath(
  file: DescFile,
  path: readonly number[],
): CommentedDesc | undefined {
  // We only recognise descriptor paths, which always come as (tag, index) pairs.
  // Anything odd-length, empty, or pointing into file-level scalars (e.g.
  // `package` or `syntax`) is silently ignored.
  if (path.length === 0 || path.length % 2 !== 0) return undefined;

  let parent: DescMessage | DescEnum;
  const rootTag = path[0]!;
  const rootIdx = path[1]!;
  if (rootTag === FILE_MESSAGE_TYPE) {
    const m = file.messages[rootIdx];
    if (!m) return undefined;
    if (path.length === 2) return m;
    parent = m;
  } else if (rootTag === FILE_ENUM_TYPE) {
    const e = file.enums[rootIdx];
    if (!e) return undefined;
    if (path.length === 2) return e;
    parent = e;
  } else {
    return undefined;
  }

  for (let i = 2; i < path.length; i += 2) {
    const tag = path[i]!;
    const idx = path[i + 1]!;
    const isLast = i + 2 === path.length;

    if (parent.kind === "enum") {
      if (tag !== ENUM_VALUE) return undefined;
      const v = parent.values[idx];
      // enum values are leaves — any path that continues past them is a
      // location for a sub-field on EnumValueDescriptorProto, which we ignore.
      if (!v || !isLast) return undefined;
      return v;
    }

    switch (tag) {
      case MSG_FIELD: {
        const f = parent.fields[idx];
        if (!f || !isLast) return undefined;
        return f;
      }
      case MSG_ONEOF_DECL: {
        const o = parent.oneofs[idx];
        if (!o || !isLast) return undefined;
        return o;
      }
      case MSG_NESTED_TYPE: {
        const m = parent.nestedMessages[idx];
        if (!m) return undefined;
        if (isLast) return m;
        parent = m;
        break;
      }
      case MSG_ENUM_TYPE: {
        const e = parent.nestedEnums[idx];
        if (!e) return undefined;
        if (isLast) return e;
        parent = e;
        break;
      }
      default:
        return undefined;
    }
  }

  return undefined;
}
