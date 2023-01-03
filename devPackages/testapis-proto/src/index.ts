import { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";

import { fileDescriptorSetBins } from "./__generated__/fileDescriptorSetBins";

export type TestapisPackage = keyof typeof fileDescriptorSetBins;

export function getTestapisFileDescriptorSet(
  pkg: TestapisPackage
): FileDescriptorSet {
  return FileDescriptorSet.deserializeBinary(
    Buffer.from(fileDescriptorSetBins[pkg], "base64")
  );
}

export function buildCodeGeneratorRequest(
  pkg: TestapisPackage
): CodeGeneratorRequest {
  const descSet = getTestapisFileDescriptorSet(pkg);
  const req = new CodeGeneratorRequest();

  for (const fd of descSet.getFileList()) {
    req.addProtoFile(fd);

    const filename = fd.getName();
    const pat = new RegExp(`^${pkg.replace(/\./g, "/")}/[^/]+\\.proto$`);
    if (filename && pat.test(filename)) {
      req.addFileToGenerate(filename);
    }
  }

  return req;
}
