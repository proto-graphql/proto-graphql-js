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
    const files = resp.file.map((f) => f.toJson());
    expect(files).toMatchSnapshot();
  });
});
