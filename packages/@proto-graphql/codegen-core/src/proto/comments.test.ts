import {
  createFileRegistry,
  type DescEnum,
  type DescFile,
  type DescMessage,
} from "@bufbuild/protobuf";
import { getComments } from "@bufbuild/protoplugin";
import {
  getTestapisFileDescriptorSet,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { describe, expect, it } from "vitest";
import { type CommentedDesc, getCommentsFor } from "./comments";

function* walkEnum(e: DescEnum): Generator<CommentedDesc> {
  yield e;
  for (const v of e.values) yield v;
}

function* walkMessage(m: DescMessage): Generator<CommentedDesc> {
  yield m;
  for (const f of m.fields) yield f;
  for (const o of m.oneofs) yield o;
  for (const nm of m.nestedMessages) yield* walkMessage(nm);
  for (const ne of m.nestedEnums) yield* walkEnum(ne);
}

function* walkFile(file: DescFile): Generator<CommentedDesc> {
  for (const m of file.messages) yield* walkMessage(m);
  for (const e of file.enums) yield* walkEnum(e);
}

function descLabel(desc: CommentedDesc): string {
  switch (desc.kind) {
    case "message":
    case "enum":
      return `${desc.kind} ${desc.typeName}`;
    case "field":
      return `field ${desc.parent.typeName}.${desc.name}`;
    case "oneof":
      return `oneof ${desc.parent.typeName}.${desc.name}`;
    case "enum_value":
      return `enum_value ${desc.parent.typeName}.${desc.name}`;
    default: {
      const _exhaustive: never = desc;
      return `${(_exhaustive as { kind: string }).kind}`;
    }
  }
}

const FIXTURES: TestapisPackage[] = [
  // Many leading comments on fields with behavior keywords.
  "testapis.behavior.field_comments",
  // Nested messages, nested enums, enum values.
  "testapis.basic.nested",
  "testapis.basic.enums",
  // oneof with comment on the oneof itself.
  "testapis.oneof.message_only",
  // No (or sparse) comments — must still report leading/trailing as undefined.
  "testapis.basic.empty",
];

describe("getCommentsFor", () => {
  for (const pkg of FIXTURES) {
    describe(pkg, () => {
      const fds = getTestapisFileDescriptorSet(pkg);
      const registry = createFileRegistry(fds);
      // Pick the file whose package matches `pkg` so we exercise the actual
      // .proto under test rather than well-known transitively included files.
      const targetFile = [...registry.files].find(
        (f) => f.proto.package === pkg,
      );
      if (!targetFile) {
        throw new Error(`could not find DescFile for ${pkg}`);
      }
      const descs = [...walkFile(targetFile)];

      it("walks at least one descriptor", () => {
        expect(descs.length).toBeGreaterThan(0);
      });

      it.each(
        descs.map((d) => [descLabel(d), d] as const),
      )("matches @bufbuild/protoplugin.getComments for %s", (_label, desc) => {
        const expected = getComments(desc);
        const actual = getCommentsFor(desc);
        expect(actual.leading).toBe(expected.leading);
        expect(actual.trailing).toBe(expected.trailing);
        expect(actual.leadingDetached).toEqual(expected.leadingDetached);
      });
    });
  }

  it("returns empty leadingDetached for a desc whose file has no sourceCodeInfo", () => {
    // Hand-build a request without sourceCodeInfo to make sure we don't blow up.
    const fds = getTestapisFileDescriptorSet("testapis.basic.empty");
    // Strip sourceCodeInfo from each file before creating the registry.
    for (const f of fds.file) {
      f.sourceCodeInfo = undefined;
    }
    const registry = createFileRegistry(fds);
    const file = [...registry.files].find(
      (f) => f.proto.package === "testapis.basic.empty",
    );
    if (!file) throw new Error("file not found");
    const first = [...walkFile(file)][0];
    if (!first) throw new Error("no descs in fixture");

    const result = getCommentsFor(first);
    expect(result.leading).toBeUndefined();
    expect(result.trailing).toBeUndefined();
    expect(result.leadingDetached).toEqual([]);
  });
});
