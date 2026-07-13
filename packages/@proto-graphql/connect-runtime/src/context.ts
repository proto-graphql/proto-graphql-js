import type { CallOptions, ConnectError, Transport } from "@connectrpc/connect";

/**
 * Context convention shared by this package's runtime helpers (`getClient`,
 * `createRpcLoader`) and by code generated from `.proto` files that declare
 * GraphQL operations or dataloaders.
 *
 * A consumer's own context type does not need to extend this interface
 * nominally — any object that is structurally shaped like this satisfies it.
 *
 * See docs/design/grpc-service-to-graphql/design.md §3.3.
 */
export interface ProtoGraphqlConnectContext {
  protoGraphql: {
    /**
     * Default transport used to create RPC clients when no per-service
     * override is configured in `transports`.
     */
    transport: Transport;
    /**
     * Per-service transport override, keyed by the service's `typeName`
     * (e.g. `"my.pkg.UserService"`). Falls back to `transport` when a
     * service has no entry here.
     */
    transports?: Map<string, Transport>;
    /**
     * Derives per-request `CallOptions` (headers, signal, etc.) from the
     * context. Invoked once per RPC call.
     */
    callOptions?: (ctx: unknown) => CallOptions;
    /**
     * Overrides how a `ConnectError` raised by an RPC call is converted
     * before it reaches the caller. Used by `callRpc` from the
     * `@proto-graphql/connect-runtime/graphql` entry (defaults to
     * `defaultConnectErrorHandler`, which maps to `GraphQLError`).
     *
     * The type is declared here, on this GraphQL-free root entry, so
     * context types and generated code can declare it without depending on
     * `graphql` themselves.
     */
    errorHandler?: (err: ConnectError) => Error;
  };
}
