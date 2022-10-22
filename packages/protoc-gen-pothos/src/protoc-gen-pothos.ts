import { withCodeGeneratorRequest } from "@proto-graphql/protoc-plugin-helpers";
import { processRequest } from "./process";

withCodeGeneratorRequest(processRequest);
