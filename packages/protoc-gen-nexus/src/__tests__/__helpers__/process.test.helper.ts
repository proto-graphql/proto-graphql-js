import { execSync } from "child_process";
import { promises as fs } from "fs";
import { join, dirname } from "path";

import { glob } from "glob";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import * as ts from "typescript";

import { processRequest } from "../../process";


const generationTargets = ["native protobuf", "protobufjs"] as const;
type GenerationTarget = typeof generationTargets[number];

export async function generateDSLs(
  name: string,
  target: GenerationTarget,
  opts: {
    withPrefix?: boolean;
    perGraphQLType?: boolean;
    partialInputs?: boolean;
  } = {}
) {
  const params = [];
  switch (target) {
    case "protobufjs":
      if (opts.withPrefix) params.push("import_prefix=@testapis/node/lib");
      params.push("use_protobufjs");
      break;
    case "native protobuf":
      if (opts.withPrefix)
        params.push("import_prefix=@testapis/node-native/lib");
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

export function itGeneratesNexusDSLsToMatchSnapshtos(
  name: string,
  expectedGeneratedFiles: string[]
) {
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
        files.push(
          ...(await generateDSLs(n, target, { withPrefix: true })).getFileList()
        );
      }
    });

    it("can make GraphQL schema from generated DSLs", async () => {
      await withGeneratedSchema(
        files,
        [opts.extraSchema].filter((v): v is string => v != null),
        async (dir) => {
          try {
            await validateGeneratedFiles(dir);
            const gqlSchema = await fs.readFile(
              join(dir, "schema.graphql"),
              "utf-8"
            );
            expect(gqlSchema).toMatchSnapshot("schema.graphql");
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            throw e;
          }
        }
      );
    });

    if (opts.schemaTests && opts.schemaTests.length > 0) {
      it.each(opts.schemaTests)(
        "%s",
        async (_name, { extraSchema, testQuery }) => {
          try {
            const resp = await execQuery(
              files,
              [opts.extraSchema, extraSchema].filter(
                (v): v is string => v != null
              ),
              testQuery
            );
            expect(JSON.parse(resp)).toMatchSnapshot();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            throw e;
          }
        }
      );
    }
  });
}

export function snapshotGeneratedFiles(
  resp: CodeGeneratorResponse,
  files: string[]
) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

export async function processCodeGeneration(
  name: string,
  param?: string
): Promise<CodeGeneratorResponse> {
  const req = await buildCodeGeneratorRequest(name);
  if (param) {
    req.setParameter(param);
  }
  return processRequest(req);
}

async function getFixtureFileDescriptorSet(
  name: string
): Promise<FileDescriptorSet> {
  const buf = await fs.readFile(
    join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "@testapis",
      "proto",
      "src",
      "testapis",
      name,
      "descriptor_set.pb"
    )
  );
  return FileDescriptorSet.deserializeBinary(buf);
}

async function buildCodeGeneratorRequest(
  name: string
): Promise<CodeGeneratorRequest> {
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
   
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
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
      [...new Set(files.map((f) => join(dir, dirname(f.getName()!))))].map(
        (p) => fs.mkdir(p, { recursive: true })
      )
    );
     
    await Promise.all(
      files.map((f) =>
        fs.writeFile(join(dir, f.getName()!), f.getContent()!, "utf-8")
      )
    );
    return await cb(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
  }
}

async function withGeneratedSchema(
  files: CodeGeneratorResponse.File[],
  extraSchemata: string[],
  cb: (dir: string) => Promise<void>
) {
  await withGeneratedResults(files, async (dir) => {
     
    try {
      await createSchemaTs(dir, files, extraSchemata);
      execSync(`yarn ts-node --transpile-only ${dir}/schema.ts`, { cwd: dir });
      await cb(dir);
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
    options: {
      strict: true,
    },
  });
  const diagMsgs = ts.getPreEmitDiagnostics(prog).map((d) => d.messageText);
  expect(diagMsgs).toHaveLength(0);
}

const createSchemaTs = async (
  dir: string,
  files: CodeGeneratorResponse.File[],
  extraSchemata: string[]
) => {
  const pathAliasPairs = files.map((f, i) => [f.getName()!, `types_${i}`]);

  const content = `import { makeSchema } from "nexus";
import * as path from "path";

${pathAliasPairs
  .map(([p, a]) => `import * as ${a} from "./${p.replace(/\.[^/.]+$/, "")}";`)
  .join("\n")}

${extraSchemata
  .map((_, idx) => `import * as extra_${idx} from "./extraSchema_${idx}";`)
  .join("\n")}

const schema = makeSchema({
  types: [${[
    ...pathAliasPairs.map(([_, a]) => a),
    ...extraSchemata.map((_, idx) => `extra_${idx}`),
  ].join(", ")}],
  outputs: {
    schema: path.join(__dirname, "schema.graphql"),
    typegen: path.join(__dirname, "typings.ts"),
  },
  shouldGenerateArtifacts: true,
  features: {
    abstractTypeStrategies: {
      isTypeOf: true,
    },
  },
});

export { schema };
`;

  await Promise.all(
    extraSchemata.map((content, idx) =>
      fs.writeFile(join(dir, `extraSchema_${idx}.ts`), content, "utf-8")
    )
  );
  await fs.writeFile(join(dir, "schema.ts"), content, "utf-8");
};

const execQuery = async (
  files: CodeGeneratorResponse.File[],
  extraSchemata: string[],
  query: string
) => {
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

  return await withGeneratedResults(files, async (dir) => {
    await createSchemaTs(dir, files, extraSchemata);
    await fs.writeFile(join(dir, "execQuery.ts"), execQueryTs, "utf-8");

    const resp = execSync(
      `yarn --silent ts-node --transpile-only ${dir}/execQuery.ts`,
      { cwd: dir }
    );
    return resp.toString("utf-8");
  });
};
