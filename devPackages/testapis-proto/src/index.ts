import { CodeGeneratorRequest, FileDescriptorSet } from "@bufbuild/protobuf";

import { fileDescriptorSetBins } from "./__generated__/fileDescriptorSetBins";

export type TestapisPackage = keyof typeof fileDescriptorSetBins;

export function getTestapisFileDescriptorSet(
  pkg: TestapisPackage,
): FileDescriptorSet {
  return FileDescriptorSet.fromBinary(
    Buffer.from(fileDescriptorSetBins[pkg], "base64"),
  );
}

export function buildCodeGeneratorRequest(
  pkg: TestapisPackage,
): CodeGeneratorRequest {
  const descSet = getTestapisFileDescriptorSet(pkg);
  const req = new CodeGeneratorRequest();

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
