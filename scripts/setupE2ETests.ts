#!/usr/bin/env -S pnpm exec tsx

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const testsDir = "e2e/tests";

const protoLibs = [
  "google-protobuf",
  "protobufjs",
  "ts-proto",
  "ts-proto-with-forcelong-number",
  "protobuf-es",
] as const;
type ProtoLib = (typeof protoLibs)[number];

const plugins = ["nexus", "pothos"] as const;
type Plugin = (typeof plugins)[number];

type TestCase = {
  target: Plugin;
  proto: {
    package: string;
    lib: ProtoLib;
  };
};

function getTestName(test: TestCase): string {
  return [
    test.target,
    test.proto.package.replace("/", "-"),
    test.proto.lib,
  ].join("--");
}

function getTestPath(test: TestCase): string {
  return `${testsDir}/${getTestName(test)}`;
}

const rootDir = join("..", "..", "..");
const bufDir = join(rootDir, "devPackages", "testapis-proto", "proto");

async function genPackageJson(test: TestCase): Promise<void> {
  const protoPackages = {
    "google-protobuf": [
      "@proto-graphql/e2e-testapis-google-protobuf",
      "@proto-nexus/google-protobuf",
      "proto-nexus",
      "protoc-gen-nexus",
    ],
    protobufjs: [
      "@proto-graphql/e2e-testapis-protobufjs",
      "@proto-nexus/protobufjs",
      "protoc-gen-nexus",
      "proto-nexus",
    ],
    "ts-proto": ["@proto-graphql/e2e-testapis-ts-proto", "protoc-gen-pothos"],
    "ts-proto-with-forcelong-number": [
      "@proto-graphql/e2e-testapis-ts-proto-with-forcelong-number",
      "protoc-gen-pothos",
    ],
    "protobuf-es": [
      "@proto-graphql/e2e-testapis-protobuf-es",
      "@proto-graphql/scalars-protobuf-es",
      "protoc-gen-pothos",
    ],
  };
  const protoPath = join(bufDir, "testapis", test.proto.package);

  const deps =
    test.proto.lib === "protobuf-es"
      ? { "@bufbuild/protobuf": "catalog:protobuf-es-v1" }
      : undefined;

  const packageJson = {
    name: `@proto-graphql/e2e-${getTestName(test)}`,
    version: "0.0.0",
    description: `E2E tests for protoc-gen-${test.target}`,
    private: true,
    scripts: {
      "test:e2e": ["gen", "vitest", "schema", "typecheck"]
        .map((t) => `pnpm run test:e2e:${t}`)
        .join(" && "),
      "test:e2e:gen": [
        "rm -rf __generated__",
        ...["proto", "gql"].map((t) => `pnpm run test:e2e:gen:${t}`),
      ].join(" && "),
      "test:e2e:gen:gql": "tsx schema.ts",
      "test:e2e:gen:proto": "buf generate --template buf.gen.json",
      "test:e2e:vitest":
        "vitest run --passWithNoTests --config ../../vitest.config.ts",
      "test:e2e:schema": "git diff --exit-code __generated__/schema.graphql",
      "test:e2e:typecheck": "tsc --build tsconfig.json",
    },
    dependencies: deps,
    devDependencies: Object.fromEntries(
      [
        "@proto-graphql/e2e-helper",
        "@proto-graphql/tsconfig",
        ...protoPackages[test.proto.lib],
      ]
        .sort()
        .map((pkg) => [pkg, "workspace:*"]),
    ),
  };

  const testPath = getTestPath(test);

  await mkdir(testPath, { recursive: true });

  await writeFile(
    join(testPath, "package.json"),
    JSON.stringify(packageJson, undefined, 2),
    "utf-8",
  );
}

async function genBufGemTemplate(test: TestCase): Promise<void> {
  const genDir = join("__generated__", "schema");

  const pluginOpts = {
    nexus: {
      protobufjs: [
        "use_protobufjs",
        "import_prefix=@proto-graphql/e2e-testapis-protobufjs/lib/",
      ],
      "google-protobuf": [
        "import_prefix=@proto-graphql/e2e-testapis-google-protobuf/lib/",
      ],
    },
    pothos: {
      "ts-proto": [
        "import_prefix=@proto-graphql/e2e-testapis-ts-proto/lib/",
        "pothos_builder_path=../../builder",
        "scalar=int64=String",
        "scalar=uint64=String",
        "scalar=sint64=String",
        "scalar=fixed64=String",
        "scalar=sfixed64=String",
        "scalar=google.protobuf.Int64Value=String",
        "scalar=google.protobuf.UInt64Value=String",
        "scalar=google.protobuf.SInt64Value=String",
        "scalar=google.protobuf.Fixed64Value=String",
        "scalar=google.protobuf.SFixed64Value=String",
      ],
      "ts-proto-with-forcelong-number": [
        "import_prefix=@proto-graphql/e2e-testapis-ts-proto-with-forcelong-number/lib/",
        "pothos_builder_path=../../builder",
        "scalar=int64=Int",
        "scalar=uint64=Int",
        "scalar=sint64=Int",
        "scalar=fixed64=Int",
        "scalar=sfixed64=Int",
        "scalar=google.protobuf.Int64Value=Int",
        "scalar=google.protobuf.UInt64Value=Int",
        "scalar=google.protobuf.SInt64Value=Int",
        "scalar=google.protobuf.Fixed64Value=Int",
        "scalar=google.protobuf.SFixed64Value=Int",
      ],
      "protobuf-es": [
        "import_prefix=@proto-graphql/e2e-testapis-protobuf-es/lib/",
        "pothos_builder_path=../../builder",
        "protobuf_lib=protobuf-es",
      ],
    },
  };

  const tmpl = {
    version: "v2",
    plugins: [
      {
        local: `../../../packages/protoc-gen-${test.target}/bin/protoc-gen-${test.target}`,
        out: genDir,
        opt: (pluginOpts[test.target] as Record<string, string[]>)[
          test.proto.lib
        ],
      },
    ],
    inputs: [
      {
        directory: bufDir,
        paths: [join(bufDir, "testapis", test.proto.package)],
      },
    ],
  };

  await writeFile(
    join(getTestPath(test), "buf.gen.json"),
    JSON.stringify(tmpl, undefined, 2),
    "utf-8",
  );
}

async function main() {
  /** @type {TestCase[]} */
  const config = JSON.parse(await readFile("e2e/tests.json", "utf-8"));

  await Promise.all([
    ...config.tests.map(genPackageJson),
    ...config.tests.map(genBufGemTemplate),
  ]);
}

main();
