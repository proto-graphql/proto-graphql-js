import { createProcessor } from "@proto-graphql/protoc-plugin-helpers";
import { generateFiles } from "./printer";

export const processRequest = createProcessor({ generateFiles });
