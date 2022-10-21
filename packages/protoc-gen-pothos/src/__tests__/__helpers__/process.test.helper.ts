import { promises as fs } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { glob } from "glob";
import * as ts from "typescript";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest } from "../../process";
import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";

const generationTargets = ["ts-proto"] as const;
type GenerationTarget = typeof generationTargets[number];

export async function generateDSLs(
  name: string,
  target: GenerationTarget,
  opts: { withPrefix?: boolean; perGraphQLType?: boolean; partialInputs?: boolean } = {}
) {
  const params = [];
  switch (target) {
    case "ts-proto":
      if (opts.withPrefix) params.push("import_prefix=@testapis/ts-proto/lib");
      break;
    default: {
      const _exhaustiveCheck: never = target;
      throw "unreachable";
    }
  }
  if (opts.perGraphQLType) {
    params.push("file_layout=graphql_type");
  }
  if (opts.partialInputs) {
    params.push("partial_inputs");
  }
  return await processCodeGeneration(name, params.join(","));
}

export function itGeneratesDSLsToMatchSnapshtos(name: string, expectedGeneratedFiles: string[]) {
  describe.each(generationTargets)("with %s", (target) => {
    it("generates pothos DSLs", async () => {
      const resp = await generateDSLs(name, target);
      snapshotGeneratedFiles(resp, expectedGeneratedFiles);
    });
  });
}

export function testSchemaGeneration(
  name: string | string[],
  target: GenerationTarget,
  opts: {
    builderTs?: string;
    extraSchema?: string;
    schemaTests?: [
      name: string,
      params: {
        extraSchema: string;
        testQuery: string;
      }
    ][];
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

    if (opts.schemaTests && opts.schemaTests.length > 0) {
      it.each(opts.schemaTests)("%s", async (_name, { extraSchema, testQuery }) => {
        try {
          await withGeneratedResults(files, async (dir) => {
            await createBuilderTs(dir, { builderTs: opts.builderTs });
            await createSchemaTs(
              dir,
              files,
              [opts.extraSchema, extraSchema].filter((v): v is string => v != null)
            );
            await createExecQueryTs(dir, testQuery);
            await validateGeneratedFiles(dir);

            const resp = execSync(`yarn --silent ts-node --transpile-only ${dir}/execQuery.ts`, { cwd: dir });
            expect(JSON.parse(resp.toString("utf-8"))).toMatchSnapshot();

            const gqlSchema = await fs.readFile(join(dir, "schema.graphql"), "utf-8");
            expect(gqlSchema).toMatchSnapshot("schema.graphql");
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

export function snapshotGeneratedFiles(resp: CodeGeneratorResponse, files: string[]) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

export async function processCodeGeneration(name: string, param?: string): Promise<CodeGeneratorResponse> {
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return resp.getFileList().reduce((m, f) => ({ ...m, [f.getName()!]: f.getContent()! }), {} as Record<string, string>);
}

async function withGeneratedResults<T>(
  files: CodeGeneratorResponse.File[],
  cb: (dir: string) => Promise<T>
): Promise<T> {
  const suffix = Math.random().toString(36).substring(7);
  const dir = join(__dirname, "__generated__", suffix);
  try {
    await fs.mkdir(dir, { recursive: true });
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [...new Set(files.map((f) => join(dir, dirname(f.getName()!))))].map((p) => fs.mkdir(p, { recursive: true }))
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await Promise.all(files.map((f) => fs.writeFile(join(dir, f.getName()!), f.getContent()!, "utf-8")));
    return await cb(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
  }
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
    options: {
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  });
  const diagMsgs = ts.getPreEmitDiagnostics(prog).map((d) => d.messageText);
  expect(diagMsgs).toHaveLength(0);
}

const createBuilderTs = async (dir: string, opts: { builderTs?: string }) => {
  const content =
    opts.builderTs ??
    `import SchemaBuilder from "@pothos/core";

export const builder = new SchemaBuilder({});
builder.queryType();
`;

  await fs.writeFile(join(dir, "builder.ts"), content, "utf-8");
};

const createSchemaTs = async (dir: string, files: CodeGeneratorResponse.File[], extraSchemata: string[]) => {
  const content = `import { join } from "path";
import { writeFileSync } from "fs";
import { builder } from "./builder";
import { printSchema } from "graphql/utilities";

${extraSchemata.map((_, idx) => `import "./extraSchema_${idx}";`).join("\n")}

export const schema = builder.toSchema();

writeFileSync(join(__dirname, "schema.graphql"), printSchema(schema), "utf-8");
`;
  await Promise.all(
    extraSchemata.map((content, idx) => fs.writeFile(join(dir, `extraSchema_${idx}.ts`), content, "utf-8"))
  );
  await fs.writeFile(join(dir, "schema.ts"), content, "utf-8");
};

const createExecQueryTs = async (dir: string, query: string) => {
  const execQueryTs = `
import { stdout } from "process";
import { graphql } from "graphql";
import { schema } from "./schema";

graphql(
  schema,
  \`
  ${query}
  \`
).then(resp => stdout.write(JSON.stringify(resp)));
`;

  await fs.writeFile(join(dir, "execQuery.ts"), execQueryTs, "utf-8");
};
