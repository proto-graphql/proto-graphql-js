import { asNexusMethod } from "@nexus/schema";
import { DateTimeResolver } from "graphql-scalars";

export const dateTime = asNexusMethod(DateTimeResolver, "dateTime");
