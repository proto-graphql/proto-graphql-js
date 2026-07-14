import { builder } from "./builder.js";
// Side-effect import: registers this file's `builder.queryField`/
// `builder.mutationField` calls (design.md §5-4 — unlike other golden
// cases, this one must actually build the operations into the schema).
import "./__generated__/testapis/service/basic/basic.pb.pothos.js";

export const schema = builder.toSchema();
