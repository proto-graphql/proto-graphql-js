import { toJson } from "@bufbuild/protobuf";
import { CodeGeneratorResponse_FileSchema } from "@bufbuild/protobuf/wkt";
import {
  buildCodeGeneratorRequest,
  testapisPackages,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { protocGenNexus } from "./plugin";

const testGorups = testapisPackages.map((pkg) => ({
  pkg,
  tests: [
    { test: "without import prefix", param: undefined },
    { test: "with import prefix", param: "import_prefix=@testapis/proto" },
    {
      test: "with use_protobufjs",
      param: "import_prefix=@testapis/proto,use_protobufjs",
    },
    {
      test: "with graphql_type layout",
      param: "import_prefix=@testapis/proto,file_layout=graphql_type",
    },
    {
      test: "with partial inputs",
      param: "import_prefix=@testapis/proto,partial_inputs",
    },
  ],
}));

describe.each(testGorups)("$pkg", ({ pkg, tests }) => {
  test.each(tests)("generates files by plugin $test", ({ param }) => {
    const req = buildCodeGeneratorRequest(pkg, { param });
    const resp = protocGenNexus.run(req);
    const files = resp.file.map((f) =>
      toJson(CodeGeneratorResponse_FileSchema, f),
    );
    expect(files).toMatchSnapshot();
  });
});
