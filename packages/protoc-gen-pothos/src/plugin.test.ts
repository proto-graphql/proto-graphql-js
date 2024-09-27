import { toJson } from "@bufbuild/protobuf";
import { CodeGeneratorResponse_FileSchema } from "@bufbuild/protobuf/wkt";
import {
  buildCodeGeneratorRequest,
  testapisPackages,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { protocGenPothos } from "./plugin";

const testGorups = testapisPackages.map((pkg) => ({
  pkg,
  tests: [
    { test: "without import prefix", param: undefined },
    { test: "with import prefix", param: "import_prefix=@testapis/ts-proto" },
    {
      test: "with graphql_type layout",
      param: "import_prefix=@testapis/ts-proto,file_layout=graphql_type",
    },
    {
      test: "with partial inputs",
      param: "import_prefix=@testapis/ts-proto,partial_inputs",
    },
  ],
}));

describe.each(testGorups)("$pkg", ({ pkg, tests }) => {
  test.each(tests)("generates files by plugin $test", ({ param }) => {
    const req = buildCodeGeneratorRequest(pkg, { param });
    const resp = protocGenPothos.run(req);
    const files = resp.file.map((f) =>
      toJson(CodeGeneratorResponse_FileSchema, f),
    );
    expect(files).toMatchSnapshot();
  });
});

describe("protobuf-es", () => {
  const testGorups = testapisPackages.map((pkg) => ({
    pkg,
    tests: [
      { test: "without import prefix", param: "protobuf_lib=protobuf-es" },
      {
        test: "with import prefix",
        param: "protobuf_lib=protobuf-es,import_prefix=@testapis/protobuf-es",
      },
      {
        test: "with graphql_type layout",
        param:
          "protobuf_lib=protobuf-es,import_prefix=@testapis/protobuf-es,file_layout=graphql_type",
      },
      {
        test: "with partial inputs",
        param:
          "protobuf_lib=protobuf-es,import_prefix=@testapis/protobuf-es,partial_inputs",
      },
    ],
  }));

  describe.each(testGorups)("$pkg", ({ pkg, tests }) => {
    test.each(tests)("generates files by plugin $test", ({ param }) => {
      const req = buildCodeGeneratorRequest(pkg, { param });
      const resp = protocGenPothos.run(req);
      const files = resp.file.map((f) =>
        toJson(CodeGeneratorResponse_FileSchema, f),
      );
      expect(files).toMatchSnapshot();
    });
  });
});

describe("with scalar type override", () => {
  test("maps testapis.custom_types.Date to Date scalar", () => {
    const req = buildCodeGeneratorRequest("testapis.custom_types", {
      param: "scalar=testapis.custom_types.Date=Date",
    });
    const resp = protocGenPothos.run(req);
    const files = resp.file.map((f) =>
      toJson(CodeGeneratorResponse_FileSchema, f),
    );
    expect(files).toMatchSnapshot();
  });

  describe("maps 64bit integers to bigint", () => {
    test.each([
      { pkg: "testapis.primitives" },
      { pkg: "testapis.wktypes" },
    ] as const)("generates files from $pkg", ({ pkg }) => {
      const req = buildCodeGeneratorRequest(pkg, {
        param: [
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
        ].join(","),
      });
      const resp = protocGenPothos.run(req);
      const files = resp.file.map((f) =>
        toJson(CodeGeneratorResponse_FileSchema, f),
      );
      expect(files).toMatchSnapshot();
    });
  });
});
