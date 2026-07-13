import type {
  GenService,
  GenServiceMethods,
} from "@bufbuild/protobuf/codegenv2";
import { type Client, createClient, type Transport } from "@connectrpc/connect";
import type { ProtoGraphqlConnectContext } from "./context.js";

// Transport -> service typeName -> memoized client. Keyed on the resolved
// Transport instance (rather than on `ctx`) so that a client is reused by
// every ctx that shares the same transport, and clients are naturally
// garbage-collected once nothing references their transport anymore.
const clientsByTransport = new WeakMap<Transport, Map<string, unknown>>();

/**
 * Resolves (and memoizes) a Connect client for `service`, using the
 * transport configured on `ctx`: a per-service override from
 * `protoGraphql.transports`, falling back to `protoGraphql.transport`.
 *
 * See docs/design/grpc-service-to-graphql/design.md §3.3.
 */
export function getClient<S extends GenService<GenServiceMethods>>(
  ctx: ProtoGraphqlConnectContext,
  service: S,
): Client<S> {
  const transport =
    ctx.protoGraphql.transports?.get(service.typeName) ??
    ctx.protoGraphql.transport;

  let clientsByTypeName = clientsByTransport.get(transport);
  if (!clientsByTypeName) {
    clientsByTypeName = new Map();
    clientsByTransport.set(transport, clientsByTypeName);
  }

  const cached = clientsByTypeName.get(service.typeName);
  if (cached) {
    return cached as Client<S>;
  }

  const client = createClient(service, transport);
  clientsByTypeName.set(service.typeName, client);
  return client;
}
