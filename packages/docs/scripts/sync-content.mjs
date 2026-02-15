import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
const sourceRoot = path.join(repoRoot, "docs");
const targetRoot = path.join(repoRoot, "packages/docs/src/content");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function isMarkdown(filePath) {
  return filePath.endsWith(".md") || filePath.endsWith(".mdx");
}

function rewriteReadmeLinks(markdown) {
  return markdown.replace(
    /\]\(([^)\s]*?)README\.md(#[^)]+)?\)/g,
    "]($1index.md$2)",
  );
}

function mapDestinationRelativePath(sourceRelativePath) {
  return sourceRelativePath.replace(/(^|\/)README\.md$/, "$1index.md");
}

async function cleanGeneratedMarkdown() {
  if (!(await exists(targetRoot))) {
    return;
  }
  const targetFiles = await walk(targetRoot);
  await Promise.all(
    targetFiles
      .filter(isMarkdown)
      .map((filePath) => fs.rm(filePath, { force: true })),
  );
}

async function syncDocs() {
  if (!(await exists(sourceRoot))) {
    throw new Error(`Source docs directory not found: ${sourceRoot}`);
  }

  await cleanGeneratedMarkdown();

  const sourceFiles = await walk(sourceRoot);
  for (const sourcePath of sourceFiles) {
    const relativePath = path.relative(sourceRoot, sourcePath);
    const targetRelativePath = mapDestinationRelativePath(relativePath);
    const targetPath = path.join(targetRoot, targetRelativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    if (isMarkdown(sourcePath)) {
      const content = await fs.readFile(sourcePath, "utf8");
      const rewritten = rewriteReadmeLinks(content);
      await fs.writeFile(targetPath, rewritten, "utf8");
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }
}

await syncDocs();
console.log("Synced docs/ into packages/docs/src/content");
