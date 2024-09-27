import { create, fromBinary } from "@bufbuild/protobuf";
import {
  type CodeGeneratorRequest,
  CodeGeneratorRequestSchema,
  type FileDescriptorSet,
  FileDescriptorSetSchema,
} from "@bufbuild/protobuf/wkt";
import { fileDescriptorSetBins } from "./__generated__/fileDescriptorSetBins";

function objectKeys<K extends string>(obj: Record<K, unknown>): K[] {
  return Object.keys(obj) as K[];
}

export const testapisPackages = objectKeys(fileDescriptorSetBins);
export type TestapisPackage = keyof typeof fileDescriptorSetBins;

export function getTestapisFileDescriptorSet(
  pkg: TestapisPackage,
): FileDescriptorSet {
  return fromBinary(
    FileDescriptorSetSchema,
    Buffer.from(fileDescriptorSetBins[pkg], "base64"),
  );
}

export function buildCodeGeneratorRequest(
  pkg: TestapisPackage,
  { param }: { param?: string } = {},
): CodeGeneratorRequest {
  const descSet = getTestapisFileDescriptorSet(pkg);
  const req = create(CodeGeneratorRequestSchema, { parameter: param });

  for (const fd of descSet.file) {
    req.protoFile.push(fd);

    const filename = fd.name;
    const pat = new RegExp(`^${pkg.replace(/\./g, "/")}/[^/]+\\.proto$`);
    if (filename && pat.test(filename)) {
      req.fileToGenerate.push(filename);
    }
  }

  return req;
}
