type TransformFunc<In, Out> = (input: In | null | undefined) => Out | null;

export interface Transformer<ProtoType, GqlType> {
  protoToGql: TransformFunc<ProtoType, GqlType>;
  gqlToProto: TransformFunc<GqlType, ProtoType>;
}

export const transformers: Record<string, Transformer<any, any>> = {};

/**
 * @param protoTypeFullName e.g. `google.protobuf.StringValue`
 * @param transformer transformer object
 */
export function registerTransformer<ProtoType, GqlType>(
  protoTypeFullName: string,
  transformer: Transformer<ProtoType, GqlType>
) {
  transformers[protoTypeFullName] = transformer;
}

export function getTransformer(protoTypeFullName: string): Transformer<any, any> {
  const t = transformers[protoTypeFullName];
  if (t == null) {
    throw new Error(`Transformer for ${protoTypeFullName} is not registered`);
  }
  return t;
}
