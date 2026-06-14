import { createFileRegistry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import { getTestapisFileDescriptorSet } from "@proto-graphql/testapis-proto";
import { describe, expect, it } from "vitest";
import { createRegistryFromSchema } from "./registry";

describe("createRegistryFromSchema", () => {
  const fds = getTestapisFileDescriptorSet("testapis.basic.presence");
  const files = [...createFileRegistry(fds).files];
  const fakeSchema = (allFiles: typeof files): Schema =>
    ({ allFiles }) as unknown as Schema;

  it("builds a registry that resolves messages from the schema files", () => {
    const registry = createRegistryFromSchema(fakeSchema(files));
    expect(
      registry.getMessage("testapis.basic.presence.Message"),
    ).toBeDefined();
  });

  it("returns the same registry instance for the same schema (memoized)", () => {
    const schema = fakeSchema(files);
    expect(createRegistryFromSchema(schema)).toBe(
      createRegistryFromSchema(schema),
    );
  });

  it("builds a separate registry for a different schema", () => {
    expect(createRegistryFromSchema(fakeSchema(files))).not.toBe(
      createRegistryFromSchema(fakeSchema(files)),
    );
  });
});
