import { type CallOptions, Code, ConnectError } from "@connectrpc/connect";
import { GraphQLError } from "graphql";
import type { ProtoGraphqlConnectContext } from "./context.js";

/**
 * Applies `ctx`'s `callOptions` hook (if any) and invokes `fn`, converting a
 * thrown/rejected `ConnectError` into a `GraphQLError` via `ctx`'s
 * `errorHandler` (or {@link defaultConnectErrorHandler} when unset).
 *
 * Only actual `ConnectError`s are converted — any other error (a bug in
 * generated code, a network failure surfaced as a plain `Error`, etc.) is
 * rethrown unchanged rather than being coerced into a `ConnectError` first.
 * This intentionally does not use `ConnectError.from`, which would coerce
 * arbitrary values.
 *
 * This is a `graphql`-dependent counterpart to the root entry's helpers —
 * import it from `@proto-graphql/connect-runtime/graphql` so that consumers
 * of the GraphQL-free root entry (e.g. protoc-gen-dataloader's generated
 * code) never pull in `graphql`.
 *
 * See docs/design/grpc-service-to-graphql/design.md §3.3, requirements.md
 * R6.3/R6.4.
 */
export async function callRpc<T>(
  ctx: ProtoGraphqlConnectContext,
  fn: (opts: CallOptions) => Promise<T>,
): Promise<T> {
  const opts = ctx.protoGraphql.callOptions?.(ctx) ?? {};
  try {
    return await fn(opts);
  } catch (err) {
    if (err instanceof ConnectError) {
      const errorHandler =
        ctx.protoGraphql.errorHandler ?? defaultConnectErrorHandler;
      throw errorHandler(err);
    }
    throw err;
  }
}

/**
 * Converts a `ConnectError` into a `GraphQLError` whose message is the
 * error's `rawMessage` (the code-free message) and whose
 * `extensions.code` is the SCREAMING_SNAKE_CASE form of the `Code` name
 * (e.g. `Code.NotFound` -> `"NOT_FOUND"`).
 *
 * Error `details` are intentionally not included, to avoid leaking
 * backend-internal information through the GraphQL API by default. Pass a
 * custom `errorHandler` via `ProtoGraphqlConnectContext` to opt into
 * including them.
 */
export function defaultConnectErrorHandler(err: ConnectError): GraphQLError {
  return new GraphQLError(err.rawMessage, {
    extensions: { code: codeToScreamingSnakeCase(err.code) },
  });
}

// `Code` is a numeric TS enum, so `Code[code]` resolves the PascalCase name
// (e.g. `Code.NotFound` -> `"NotFound"`) that this converts to the
// SCREAMING_SNAKE_CASE form GraphQL error codes conventionally use.
function codeToScreamingSnakeCase(code: Code): string {
  return Code[code].replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}
