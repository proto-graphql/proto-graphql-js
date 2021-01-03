import { promises as fs } from "fs";
import { join, dirname } from "path";
import { glob } from "glob";
import * as ts from "typescript";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest } from "../../process";
import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { generateSchema, NexusExtendTypeDef, NexusGraphQLSchema } from "nexus/dist/core";

const generationTargets = ["native protobuf", "protobufjs"] as const;
type GenerationTarget = typeof generationTargets[number];

async function generateDSLs(name: string, target: GenerationTarget, opts: { withPrefix?: boolean } = {}) {
  const params = [];
  switch (target) {
    case "protobufjs":
      if (opts.withPrefix) params.push("import_prefix=@testapis/node/lib");
      params.push("use_protobufjs");
      break;
    case "native protobuf":
      if (opts.withPrefix) params.push("import_prefix=@testapis/node-native/lib");
      break;
    default: {
      const _exhaustiveCheck: never = target;
      throw "unreachable";
    }
  }
  return await processCodeGeneration(name, params.join(","));
}

export function itGeneratesNexusDSLsToMatchSnapshtos(name: string, expectedGeneratedFiles: string[]) {
  describe.each(generationTargets)("with %s", (target) => {
    it("generates nexus DSLs", async () => {
      const resp = await generateDSLs(name, target);
      snapshotGeneratedFiles(resp, expectedGeneratedFiles);
    });
  });
}

export function testSchemaGeneration(
  name: string | string[],
  target: GenerationTarget,
  opts: {
    types?: Record<string, any>;
    schemaTests?: [name: string, types: Record<string, any>, test: (schema: NexusGraphQLSchema) => Promise<void>][];
  } = {}
) {
  describe(`schema generation with ${target}`, () => {
    let files: CodeGeneratorResponse.File[];
    beforeEach(async () => {
      files = [];

      for (const n of Array.isArray(name) ? name : [name]) {
        files.push(...(await generateDSLs(n, target, { withPrefix: true })).getFileList());
      }
    });

    it("can make GraphQL schema from generated DSLs", async () => {
      await withGeneratedSchema(files, opts?.types ?? {}, async (dir) => {
        try {
          await validateGeneratedFiles(dir);
          const gqlSchema = await fs.readFile(join(dir, "schema.graphql"), "utf-8");
          expect(gqlSchema).toMatchSnapshot("schema.graphql");
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw e;
        }
      });
    });

    if (opts.schemaTests && opts.schemaTests.length > 0) {
      it.each(opts.schemaTests)("%s", async (_name, types, f) => {
        try {
          await withGeneratedSchema(files, { ...(opts.types ?? {}), ...types }, async (_dir, schema) => {
            await f(schema);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw e;
        }
      });
    }
  });
}

function snapshotGeneratedFiles(resp: CodeGeneratorResponse, files: string[]) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

async function processCodeGeneration(name: string, param?: string): Promise<CodeGeneratorResponse> {
  const req = await buildCodeGeneratorRequest(name);
  if (param) {
    req.setParameter(param);
  }
  return processRequest(req);
}

async function getFixtureFileDescriptorSet(name: string): Promise<FileDescriptorSet> {
  const buf = await fs.readFile(
    join(__dirname, "..", "..", "..", "..", "@testapis", "proto", "src", "testapis", name, "descriptor_set.pb")
  );
  return FileDescriptorSet.deserializeBinary(buf);
}

async function buildCodeGeneratorRequest(name: string): Promise<CodeGeneratorRequest> {
  const descSet = await getFixtureFileDescriptorSet(name);
  const req = new CodeGeneratorRequest();

  for (const fd of descSet.getFileList()) {
    req.addProtoFile(fd);

    const filename = fd.getName();
    if (filename && filename.startsWith(`testapis/${name}/`)) {
      req.addFileToGenerate(filename);
    }
  }

  return req;
}

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp.getFileList().reduce((m, f) => ({ ...m, [f.getName()!]: f.getContent()! }), {} as Record<string, string>);
}

async function withGeneratedResults(files: CodeGeneratorResponse.File[], cb: (dir: string) => Promise<void>) {
  const suffix = Math.random().toString(36).substring(7);
  const dir = join(__dirname, "__generated__", suffix);
  await fs
    .mkdir(dir, { recursive: true })
    .then(() =>
      Promise.all(
        [...new Set(files.map((f) => join(dir, dirname(f.getName()!))))].map((p) => fs.mkdir(p, { recursive: true }))
      ).then(() => dir)
    )
    .then((dir) =>
      Promise.all(files.map((f) => fs.writeFile(join(dir, f.getName()!), f.getContent()!, "utf-8"))).then(() => dir)
    )
    .then(cb)
    .finally(() => fs.rm(dir, { recursive: true, force: true, maxRetries: 3 }));
}

async function withGeneratedSchema(
  files: CodeGeneratorResponse.File[],
  queries: Record<string, NexusExtendTypeDef<"Query">>,
  cb: (dir: string, schema: NexusGraphQLSchema) => Promise<void>
) {
  await withGeneratedResults(files, async (dir) => {
    const paths = files.map((f) => join(dir, f.getName()!));
    try {
      const types = paths.reduce((o, p) => ({ ...o, ...require(p) }), {} as any);
      const schema = await generateSchema({
        types: { ...types, ...queries },
        outputs: {
          schema: join(dir, "schema.graphql"),
          typegen: join(dir, "typings.ts"),
        },
        shouldGenerateArtifacts: true,
      });
      await cb(dir, schema);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    }
  });
}

async function validateGeneratedFiles(dir: string) {
  const rootNames = await new Promise<readonly string[]>((resolve, reject) => {
    glob(join(dir, "**/*.ts"), (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
  const prog = ts.createProgram({
    rootNames,
    options: {},
  });
  const diagMsgs = ts.getPreEmitDiagnostics(prog).map((d) => d.messageText);
  expect(diagMsgs).toHaveLength(0);
}
