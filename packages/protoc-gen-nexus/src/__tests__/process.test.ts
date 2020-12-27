import { readFileSync } from "fs";
import { join } from "path";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest, parseParams } from "../process";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";

describe("parseParams", () => {
  it("reutrns true if value is empty", () => {
    expect(parseParams("use_protobufjs=true").useProtobufjs).toBe(true);
  });

  it('parses "true" string to true', () => {
    expect(parseParams("use_protobufjs=true").useProtobufjs).toBe(true);
  });

  it('parses "true" string to false', () => {
    expect(parseParams("use_protobufjs=false").useProtobufjs).toBe(false);
  });

  it("parses importPrefix", () => {
    expect(parseParams("import_prefix=@foobar/baz").importPrefix).toBe(
      "@foobar/baz"
    );
  });

  it("throws an erorr when useProtobufjs is string", () => {
    expect(() => {
      parseParams("use_protobufjs=foobar");
    }).toThrow();
  });

  it("throws an erorr when importString is boolean", () => {
    expect(() => {
      parseParams("import_prefix");
    }).toThrow();
  });

  it("throws an erorr when received unknown params", () => {
    expect(() => {
      parseParams("foobar=qux");
    }).toThrow();
  });
});

describe("simple proto file", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("hello", param);
    snapshotGeneratedFiles(resp, ["hello/hello_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("well-known protobuf types", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("wktypes", param);
    snapshotGeneratedFiles(resp, ["wktypes/well_known_types_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("protobuf enums", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("enums", param);
    snapshotGeneratedFiles(resp, ["enums/enums_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("nested protobuf types", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("nested", param);
    snapshotGeneratedFiles(resp, ["nested/nested_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("protobuf custom options", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("extensions", param);
    snapshotGeneratedFiles(resp, ["extensions/extensions_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("protobuf oneof", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("oneof", param);
    snapshotGeneratedFiles(resp, ["oneof/oneof_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("deprecation", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("deprecation", param);
    snapshotGeneratedFiles(resp, [
      "deprecation/deprecation_pb_nexus.ts",
      "deprecation/file_deprecation_pb_nexus.ts",
    ]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

describe("field_behavior", () => {
  const assertResponse = (param?: string) => {
    const resp = processCodeGeneration("field_behavior", param);
    snapshotGeneratedFiles(resp, ["field_behavior/comments_pb_nexus.ts"]);
  };

  it("generates nexus DSL with native protobuf js_out", () => {
    assertResponse();
  });

  it("generates nexus DSL with protobuf.js", () => {
    assertResponse("use_protobufjs");
  });
});

function getFixtureFileDescriptorSet(name: string): FileDescriptorSet {
  const buf = readFileSync(
    join(
      __dirname,
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

function buildCodeGeneratorRequest(name: string): CodeGeneratorRequest {
  const descSet = getFixtureFileDescriptorSet(name);
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

function processCodeGeneration(
  name: string,
  param?: string
): CodeGeneratorResponse {
  const req = buildCodeGeneratorRequest(name);
  if (param) {
    req.setParameter(param);
  }
  return processRequest(req);
}

function snapshotGeneratedFiles(resp: CodeGeneratorResponse, files: string[]) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot();
  }
}
