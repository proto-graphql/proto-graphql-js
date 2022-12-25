#!/usr/bin/env -S yarn ts-node --transpile-only

import { join } from "path";
import { exec as _exec } from "child_process";
import { readFile, copyFile, writeFile } from "fs/promises";
import { promisify } from "util";
import ignore from "ignore";

const exec = promisify(_exec);

interface Config {
  workspacePackageConfigs: WorkspacePackageConfig[];
  sortFields: Record<string, Sort>;
}

type Sort = "alphabetically";

type ObjectValues = Record<string, unknown>;

interface WorkspacePackageConfig {
  ignores?: string[];
  "package.json"?: {
    [key: string]: ObjectValues;
  };
  files?: [{ src: string; dest: string }];
}

export async function main() {
  const cfg: Config = JSON.parse(
    await readFile("workspacePackageConfig.json", { encoding: "utf-8" })
  );
  const pkgPaths = Object.values(
    JSON.parse((await exec("yarn --silent workspaces info")).stdout)
  ).map((p) => (p as { location: string }).location);

  const pkgJSONStore = new PackageJSONStore();

  const wsCfgAndPkgPathsPairs = buildWorkspaceConfigAndPkgPathsPairs(
    pkgPaths,
    cfg
  );

  // update package.json
  for (const [wsCfg, pkgPaths] of wsCfgAndPkgPathsPairs) {
    for (const pkgPath of pkgPaths) {
      for (const [key, values] of Object.entries(wsCfg["package.json"] ?? {})) {
        await pkgJSONStore.addValues({ packagePath: pkgPath, key, values });
      }
    }
  }
  await pkgJSONStore.sortFields(cfg.sortFields);
  await pkgJSONStore.writeFiles();

  // copy files
  for (const [wsCfg, pkgPaths] of wsCfgAndPkgPathsPairs) {
    for (const pkgPath of pkgPaths) {
      for (const file of wsCfg.files ?? []) {
        const src = file.src;
        const dest = join(pkgPath, file.dest);
        await copyFile(src, dest);
      }
    }
  }
}

function buildWorkspaceConfigAndPkgPathsPairs(
  pkgPaths: string[],
  cfg: Config
): [wsCfg: WorkspacePackageConfig, pkgPaths: string[]][] {
  return cfg.workspacePackageConfigs.map((wsCfg) => {
    const ig = ignore();
    if (wsCfg.ignores != null) ig.add(wsCfg.ignores);

    return [wsCfg, pkgPaths.filter(ig.createFilter())];
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

  public async addValues({
    packagePath,
    key,
    values,
  }: {
    packagePath: string;
    key: string;
    values: ObjectValues;
  }) {
    await this.setIn(packagePath, key, {
      ...((await this.getIn(packagePath, key)) as Record<string, unknown>),
      ...values,
    });
  }

  public async sortFields(sortCfg: Record<string, Sort>) {
    for (const pkgPath of Object.keys(this.pkgJSONByPath)) {
      for (const [field, sort] of Object.entries(sortCfg)) {
        let values = (await this.getIn(pkgPath, field)) as Record<
          string,
          unknown
        >;
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

    let obj: Record<string, unknown> = pkgJSON;
    for (const key of field.split(".")) {
      if (obj[key] == null) {
        obj[key] = {};
      }
      obj = obj[key] as Record<string, unknown>;
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

main();
