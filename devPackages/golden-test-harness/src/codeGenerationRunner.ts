import type { Plugin } from "@bufbuild/protoplugin";
import {
  buildCodeGeneratorRequest,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";

export interface GeneratedFile {
  name: string;
  content: string;
}

export interface CodeGenerationResult {
  files: GeneratedFile[];
  error?: string;
}

export interface ExecuteGenerationOptions {
  /** The protoplugin plugin instance to run (e.g. the result of `createEcmaScriptPlugin`). */
  plugin: Plugin;
  /** The testapis proto package to generate code for. */
  package: string;
  /** The plugin parameter string passed to the generator. */
  param?: string;
  /** Whether to match nested proto paths under the package prefix. */
  prefixMatch?: boolean;
}

/**
 * Runs the given protoplugin plugin against a testapis package and returns the
 * generated files. The plugin instance is injected so this runner stays
 * framework-agnostic and can be reused by any protoc plugin's golden tests.
 */
export function executeGeneration({
  plugin,
  package: pkg,
  param,
  prefixMatch,
}: ExecuteGenerationOptions): CodeGenerationResult {
  try {
    const req = buildCodeGeneratorRequest(pkg as TestapisPackage, {
      param,
      prefixMatch,
    });
    const resp = plugin.run(req);

    const files: GeneratedFile[] = resp.file.map((f) => ({
      name: f.name ?? "",
      content: f.content ?? "",
    }));

    return { files };
  } catch (error) {
    return {
      files: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
