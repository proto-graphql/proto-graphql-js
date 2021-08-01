/* eslint-disable no-undef */

type TransformFunc<In, Out> = (input: In | null | undefined) => Out | null;

export interface Transformer<ProtoType, GqlType> {
  protoToGql: TransformFunc<ProtoType, GqlType>;
  gqlToProto: TransformFunc<GqlType, ProtoType>;
}

export const transformers: Record<string, Transformer<any, any>> = {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProtoNexusTransformers {}
}

/**
 * @param protoTypeFullName e.g. `google.protobuf.StringValue`
 * @param transformer transformer object
 */
export function registerTransformer<ProtoTypeFullName extends keyof ProtoNexusTransformers>(
  protoTypeFullName: ProtoTypeFullName,
  transformer: ProtoNexusTransformers[ProtoTypeFullName]
) {
  transformers[protoTypeFullName] = transformer;
}

export function getTransformer<ProtoTypeFullName extends keyof ProtoNexusTransformers>(
  protoTypeFullName: ProtoTypeFullName
): ProtoNexusTransformers[ProtoTypeFullName] {
  const t = transformers[protoTypeFullName];
  if (t == null) {
    throw new Error(`Transformer for ${protoTypeFullName} is not registered`);
  }
  return t as any;
}
