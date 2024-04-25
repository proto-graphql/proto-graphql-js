import { defineWorkspace } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default defineWorkspace(["packages/*"]);
