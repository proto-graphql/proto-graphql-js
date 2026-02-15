import { create, fromBinary } from "@bufbuild/protobuf";
import {
  type CodeGeneratorRequest,
  CodeGeneratorRequestSchema,
  type FileDescriptorSet,
  FileDescriptorSetSchema,
} from "@bufbuild/protobuf/wkt";
import { fileDescriptorSetBins } from "./__generated__/fileDescriptorSetBins.js";

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
  { param, prefixMatch }: { param?: string; prefixMatch?: boolean } = {},
): CodeGeneratorRequest {
  const descSet = getTestapisFileDescriptorSet(pkg);
  const req = create(CodeGeneratorRequestSchema, { parameter: param });
  const shouldEmitImportedFiles = parseEmitImportedFiles(param);
  const filesByName = new Map(
    descSet.file
      .map((fd) => [fd.name, fd] as const)
      .filter((entry): entry is [string, (typeof descSet.file)[number]] =>
        Boolean(entry[0]),
      ),
  );
  const matchedFilenames = new Set<string>();

  for (const fd of descSet.file) {
    req.protoFile.push(fd);

    const filename = fd.name;
    const pkgPath = pkg.replace(/\./g, "/");
    const pat = prefixMatch
      ? new RegExp(`^${pkgPath}/.+\\.proto$`)
      : new RegExp(`^${pkgPath}/[^/]+\\.proto$`);
    if (filename && pat.test(filename)) {
      matchedFilenames.add(filename);
    }
  }

  if (shouldEmitImportedFiles) {
    const queue = [...matchedFilenames];
    for (let i = 0; i < queue.length; i++) {
      const current = filesByName.get(queue[i]);
      if (!current) continue;
      for (const dependency of current.dependency) {
        if (matchedFilenames.has(dependency)) continue;
        if (!filesByName.has(dependency)) continue;
        matchedFilenames.add(dependency);
        queue.push(dependency);
      }
    }
  }

  req.fileToGenerate.push(...matchedFilenames);
  return req;
}

function parseEmitImportedFiles(param: string | undefined): boolean {
  if (!param) return false;

  for (const rawPart of param.split(",")) {
    const part = rawPart.trim();
    if (!part) continue;

    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) {
      if (part === "emit_imported_files") return true;
      continue;
    }

    const key = part.slice(0, eqIndex);
    if (key !== "emit_imported_files") continue;

    const value = part.slice(eqIndex + 1);
    if (value === "" || value === "true") return true;
    if (value === "false") return false;
  }

  return false;
}
