#!/usr/bin/env -S pnpm exec ts-node --transpile-only

import { join } from "path";
import { exec as _exec } from "child_process";
import { readFile, copyFile, writeFile } from "fs/promises";
import { promisify } from "util";
import minimatch from "minimatch";

const exec = promisify(_exec);

interface Config {
  workspacePackageConfigs: WorkspacePackageConfig[];
  sortFields: Record<string, Sort>;
}

type Sort = "alphabetically";

type PrimitiveValue = string | number | boolean;
type ObjectValue = Record<string, unknown>;
type Value = PrimitiveValue | ObjectValue | Array<PrimitiveValue>;

interface WorkspacePackageConfig {
  files?: string[];
  "package.json"?: {
    [key: string]: Value;
  };
  copy?: [{ src: string; dest: string }];
}

export async function main() {
  const cfg: Config = JSON.parse(
    await readFile("workspacePackageConfig.json", { encoding: "utf-8" })
  );
  const pkgPaths = (await exec("pnpm recursive exec pwd")).stdout
    .trim()
    .split("\n");

  const pkgJSONStore = new PackageJSONStore();

  const wsCfgAndPkgPathsPairs = buildWorkspaceConfigAndPkgPathsPairs(
    pkgPaths,
    cfg
  );

  // update package.json
  for (const [wsCfg, pkgPaths] of wsCfgAndPkgPathsPairs) {
    for (const pkgPath of pkgPaths) {
      for (const [key, value] of Object.entries(wsCfg["package.json"] ?? {})) {
        await pkgJSONStore.addValue({ packagePath: pkgPath, key, value });
      }
    }
  }
  await pkgJSONStore.sortFields(cfg.sortFields);
  await pkgJSONStore.writeFiles();

  // copy files
  for (const [wsCfg, pkgPaths] of wsCfgAndPkgPathsPairs) {
    for (const pkgPath of pkgPaths) {
      for (const file of wsCfg.copy ?? []) {
        const src = file.src;
        const dest = join(pkgPath, file.dest);
        await copyFile(src, dest);
      }
    }
  }
}

function buildWorkspaceConfigAndPkgPathsPairs(
  allPkgPaths: string[],
  cfg: Config
): [wsCfg: WorkspacePackageConfig, pkgPaths: string[]][] {
  return cfg.workspacePackageConfigs.map((wsCfg) => {
    let pkgPaths = new Set<string>();
    for (const pattern of wsCfg.files ?? []) {
      for (const file of allPkgPaths.filter(minimatch.filter(pattern))) {
        pkgPaths.add(file);
      }
    }
    return [wsCfg, [...pkgPaths]];
  });
}

class PackageJSONStore {
  private pkgJSONByPath: Record<string, Record<string, unknown> | null>;

  constructor() {
    this.pkgJSONByPath = {};
  }

  public async writeFiles(): Promise<void> {
    for (const [pkgPath, pkgJSON] of Object.entries(this.pkgJSONByPath)) {
      await writeFile(
        join(pkgPath, "package.json"),
        JSON.stringify(pkgJSON, undefined, 2) + "\n",
        { encoding: "utf-8" }
      );
    }
  }

  public async addValue({
    packagePath,
    key,
    value,
  }: {
    packagePath: string;
    key: string;
    value: Value;
  }) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      await this.setIn(packagePath, key, value);
    } else if (Array.isArray(value)) {
      await this.setIn(
        packagePath,
        key,
        [
          ...(((await this.getIn(packagePath, key)) as Array<unknown>) ?? []),
          ...value,
        ].filter(isUnique())
      );
    } else {
      await this.setIn(packagePath, key, {
        ...(((await this.getIn(packagePath, key)) as Record<string, unknown>) ??
          {}),
        ...value,
      });
    }
  }

  public async sortFields(sortCfg: Record<string, Sort>) {
    for (const pkgPath of Object.keys(this.pkgJSONByPath)) {
      for (const [field, sort] of Object.entries(sortCfg)) {
        let values = (await this.getIn(pkgPath, field)) as Record<
          string,
          unknown
        >;
        if (values == null) continue;
        if (sort === "alphabetically") {
          const newObj: typeof values = {};
          for (const key of Object.keys(values).sort()) {
            newObj[key] = values[key];
          }
          values = newObj;
        }
        await this.setIn(pkgPath, field, values);
      }
    }
  }

  private async loadPkgJSON(pkgPath: string): Promise<Record<string, unknown>> {
    const pkgJSON = this.pkgJSONByPath[pkgPath];
    if (pkgJSON != null) return pkgJSON;

    const loaded = JSON.parse(
      await readFile(join(pkgPath, "package.json"), { encoding: "utf-8" })
    );
    this.pkgJSONByPath[pkgPath] = loaded;
    return loaded;
  }

  private async getIn(pkgPath: string, field: string): Promise<unknown> {
    const pkgJSON = await this.loadPkgJSON(pkgPath);

    let obj: Record<string, unknown> | undefined = pkgJSON;
    for (const key of field.split(".")) {
      obj = obj?.[key] as typeof obj;
    }

    return obj;
  }

  private async setIn(pkgPath: string, field: string, value: unknown) {
    const fieldPaths = field.split(".");

    const parentPath = fieldPaths.slice(0, -1).join(".");
    let parent: Record<string, unknown>;
    if (parentPath.length > 0) {
      parent = (await this.getIn(pkgPath, parentPath)) as Record<
        string,
        unknown
      >;
    } else {
      parent = await this.loadPkgJSON(pkgPath);
    }
    parent[fieldPaths.slice(-1)[0]] = value;
  }
}

function isUnique<V>(): (v: V) => boolean {
  const set = new Set<V>();
  return (v) => {
    if (set.has(v)) return false;
    set.add(v);
    return true;
  };
}

main();
