type TransformFunc<In, Out> = (input: In) => Out;

export interface Transformer<ProtoType, GqlType> {
  protoToGql: TransformFunc<ProtoType, GqlType>;
  gqlToProto: TransformFunc<GqlType, ProtoType>;
}

interface WrappedTransformFunc<In, Out> {
  (input: In): Out;
  (input: null | undefined): null;
}

type TransformerWrapper<T extends Transformer<any, any>> =
  T extends Transformer<infer ProtoType, infer GqlType>
    ? {
        protoToGql: WrappedTransformFunc<ProtoType, GqlType>;
        gqlToProto: WrappedTransformFunc<GqlType, ProtoType>;
      }
    : never;

export const transformers: Record<string, Transformer<any, any>> = {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProtoNexusTransformers {}
}

/**
 * @param protoTypeFullName e.g. `google.protobuf.StringValue`
 * @param transformer transformer object
 */
export function registerTransformer<
  ProtoTypeFullName extends keyof ProtoNexusTransformers,
>(
  protoTypeFullName: ProtoTypeFullName,
  transformer: ProtoNexusTransformers[ProtoTypeFullName],
) {
  transformers[protoTypeFullName] = transformer;
}

export function getTransformer<
  ProtoTypeFullName extends keyof ProtoNexusTransformers,
>(
  protoTypeFullName: ProtoTypeFullName,
): TransformerWrapper<ProtoNexusTransformers[ProtoTypeFullName]> {
  const t = transformers[protoTypeFullName];
  if (t == null) {
    throw new Error(`Transformer for ${protoTypeFullName} is not registered`);
  }
  return {
    protoToGql(v: any) {
      return v == null ? null : t.protoToGql(v);
    },
    gqlToProto(v: any) {
      return v == null ? null : t.gqlToProto(v);
    },
  } as any;
}
