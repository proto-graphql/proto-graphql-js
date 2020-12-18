import { asNexusMethod } from "nexus";
import { DateTimeResolver } from "graphql-scalars";

export const dateTime = asNexusMethod(DateTimeResolver, "dateTime");
