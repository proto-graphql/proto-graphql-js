import { dynamicInputMethod, plugin } from "nexus";
import type { NexusInputFieldConfig } from "nexus/dist/core";

export const protoFieldsPlugin = () => {
  return plugin({
    name: "ProtoFields",
    onInstall(b) {
      b.addType(
        dynamicInputMethod({
          name: "fromProto",
          typeDescription: "Adds fields from given ProtoNexus's input type",
          typeDefinition: `<T extends { _protoNexus: { fields: Record<string, core.NexusInputFieldConfig<any, any>> } }>(protoInputType: T, fieldNames: (keyof T['_protoNexus']['fields'])[]): void`,
          factory({ typeDef, args: factoryArgs }) {
            const [
              {
                _protoNexus: { fields: fieldDefs },
              },
              fieldNames,
            ] = factoryArgs as [
              {
                _protoNexus: {
                  fields: Record<string, NexusInputFieldConfig<any, any>>;
                };
              },
              string[],
            ];

            for (const fieldName of fieldNames) {
              typeDef.field(fieldName, fieldDefs[fieldName]);
            }
          },
        }),
      );
    },
  });
};
