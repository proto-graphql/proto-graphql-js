import { create, createFileRegistry, setExtension } from "@bufbuild/protobuf";
import {
  type CodeGeneratorRequest,
  CodeGeneratorRequestSchema,
  DescriptorProtoSchema,
  EnumDescriptorProtoSchema,
  EnumValueDescriptorProtoSchema,
  type FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FieldDescriptorProtoSchema,
  type FileDescriptorProto,
  FileDescriptorProtoSchema,
  file_google_protobuf_descriptor,
  type MethodDescriptorProto,
  MethodDescriptorProtoSchema,
  type MethodOptions,
  MethodOptionsSchema,
  OneofDescriptorProtoSchema,
  ServiceDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { afterEach, describe, expect, it, vi } from "vitest";
import { protocGenPothos } from "./plugin.js";

const T = FieldDescriptorProto_Type;
const OPTIONAL = FieldDescriptorProto_Label.OPTIONAL;
const REPEATED = FieldDescriptorProto_Label.REPEATED;

// GraphqlOperation enum values (graphql/schema.proto).
const QUERY = 1;
const MUTATION = 2;

// ---------------------------------------------------------------------------
// (graphql.rpc) option fixtures
//
// A wire-compatible, locally-declared subset of graphql/schema.proto's `rpc`
// extension (field number 2056 on MethodOptions). Declared here (rather than
// reaching into codegen-core's deliberately unexported generated extensions)
// so the fixtures are self-contained; extensions match by field number on the
// wire, so a MethodOptions built with this registry round-trips through
// codegen-core's real `getRpcOptions`. Mirrors protoc-gen-dataloader's
// printer.test.ts.
//
// Q31: there is no service-level opt-in construct anymore — each RPC declares
// its own exposure via `(graphql.rpc).operation`, so these fixtures only need
// to model `rpc`, not `service`.
// ---------------------------------------------------------------------------
const OPTPKG = "pothos_op_test.opts";
const RPC_EXTENSION_NUMBER = 2056;

function fld(
  name: string,
  number: number,
  type: FieldDescriptorProto_Type,
  label: FieldDescriptorProto_Label,
  opts: {
    typeName?: string;
    extendee?: string;
    oneofIndex?: number;
    proto3Optional?: boolean;
  } = {},
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number,
    type,
    label,
    typeName: opts.typeName,
    extendee: opts.extendee,
    oneofIndex: opts.oneofIndex,
    proto3Optional: opts.proto3Optional,
  });
}

const enumVal = (name: string, number: number) =>
  create(EnumValueDescriptorProtoSchema, { name, number });

function buildGraphqlOptsRegistry() {
  const file = create(FileDescriptorProtoSchema, {
    name: "pothos_op_test_options.proto",
    package: OPTPKG,
    syntax: "proto3",
    dependency: ["google/protobuf/descriptor.proto"],
    enumType: [
      create(EnumDescriptorProtoSchema, {
        name: "GraphqlOperation",
        value: [
          enumVal("GRAPHQL_OPERATION_UNSPECIFIED", 0),
          enumVal("QUERY", QUERY),
          enumVal("MUTATION", MUTATION),
        ],
      }),
    ],
    messageType: [
      create(DescriptorProtoSchema, {
        name: "GraphqlRpcOptions",
        field: [
          fld("ignore", 1, T.BOOL, OPTIONAL),
          fld("operation", 2, T.ENUM, OPTIONAL, {
            typeName: `.${OPTPKG}.GraphqlOperation`,
          }),
          fld("name", 3, T.STRING, OPTIONAL),
          fld("expose_field", 4, T.STRING, OPTIONAL),
        ],
      }),
    ],
    extension: [
      fld("rpc", RPC_EXTENSION_NUMBER, T.MESSAGE, OPTIONAL, {
        typeName: `.${OPTPKG}.GraphqlRpcOptions`,
        extendee: ".google.protobuf.MethodOptions",
      }),
    ],
  });
  return createFileRegistry(file, (name) =>
    name === "google/protobuf/descriptor.proto"
      ? file_google_protobuf_descriptor
      : undefined,
  );
}

const optsRegistry = buildGraphqlOptsRegistry();

function rpcOptions(o: {
  ignore?: boolean;
  operation?: number;
  name?: string;
  exposeField?: string;
  deprecated?: boolean;
}): MethodOptions {
  const ext = optsRegistry.getExtension(`${OPTPKG}.rpc`);
  const desc = optsRegistry.getMessage(`${OPTPKG}.GraphqlRpcOptions`);
  if (ext == null || desc == null) throw new Error("bad opts registry");
  const value = create(desc, {
    ignore: o.ignore ?? false,
    operation: o.operation ?? 0,
    name: o.name ?? "",
    exposeField: o.exposeField ?? "",
  });
  const mo = create(
    MethodOptionsSchema,
    o.deprecated ? { deprecated: true } : {},
  );
  setExtension(mo, ext, value);
  return mo;
}

function method(
  name: string,
  inputType: string,
  outputType: string,
  options: MethodOptions,
  streaming?: { client?: boolean; server?: boolean },
): MethodDescriptorProto {
  return create(MethodDescriptorProtoSchema, {
    name,
    inputType,
    outputType,
    options,
    clientStreaming: streaming?.client ?? false,
    serverStreaming: streaming?.server ?? false,
  });
}

function msg(
  name: string,
  field: FieldDescriptorProto[],
  oneofDecl: string[] = [],
) {
  return create(DescriptorProtoSchema, {
    name,
    field,
    oneofDecl: oneofDecl.map((n) =>
      create(OneofDescriptorProtoSchema, { name: n }),
    ),
  });
}

function run(
  protoFile: FileDescriptorProto[],
  fileToGenerate: string,
  parameter: string,
) {
  const req: CodeGeneratorRequest = create(CodeGeneratorRequestSchema, {
    fileToGenerate: [fileToGenerate],
    protoFile,
    parameter,
  });
  return protocGenPothos.run(req);
}

const PB_ES = "protobuf_lib=protobuf-es";

// ---------------------------------------------------------------------------

describe("protocGenPothos operations", () => {
  it("generates a Query field with flattened args (scalar, optional scalar, message, enum, oneof members)", () => {
    const pkg = "pothos_op_test.query";
    const file = create(FileDescriptorProtoSchema, {
      name: "user_query.proto",
      package: pkg,
      syntax: "proto3",
      enumType: [
        create(EnumDescriptorProtoSchema, {
          name: "Role",
          value: [enumVal("ROLE_UNSPECIFIED", 0), enumVal("ROLE_ADMIN", 1)],
        }),
      ],
      messageType: [
        msg("Address", [fld("zip", 1, T.STRING, OPTIONAL)]),
        msg("User", [fld("id", 1, T.STRING, OPTIONAL)]),
        msg(
          "GetUserRequest",
          [
            fld("user_id", 1, T.STRING, OPTIONAL),
            fld("nickname", 2, T.STRING, OPTIONAL, {
              oneofIndex: 1,
              proto3Optional: true,
            }),
            fld("address", 3, T.MESSAGE, OPTIONAL, {
              typeName: `.${pkg}.Address`,
            }),
            fld("role", 4, T.ENUM, OPTIONAL, { typeName: `.${pkg}.Role` }),
            fld("addr_a", 5, T.MESSAGE, OPTIONAL, {
              typeName: `.${pkg}.Address`,
              oneofIndex: 0,
            }),
            fld("addr_b", 6, T.MESSAGE, OPTIONAL, {
              typeName: `.${pkg}.Address`,
              oneofIndex: 0,
            }),
          ],
          ["pick", "_nickname"],
        ),
      ],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "UserService",
          method: [
            method(
              "GetUser",
              `.${pkg}.GetUserRequest`,
              `.${pkg}.User`,
              rpcOptions({ operation: QUERY }),
            ),
          ],
        }),
      ],
    });

    const resp = run([file], file.name, PB_ES);
    expect(resp.error).toBeFalsy();
    expect(resp.file[0]?.content).toMatchInlineSnapshot(`
      "// @generated by protoc-gen-pothos v0.8.1 with parameter "protobuf_lib=protobuf-es"
      // @generated from file user_query.proto (package pothos_op_test.query, syntax proto3)
      /* eslint-disable */

      import { builder } from "./builder";
      import { create, isMessage, MessageShape } from "@bufbuild/protobuf";
      import {
        Address,
        AddressSchema,
        GetUserRequest,
        GetUserRequestSchema,
        Role,
        User,
        UserSchema,
        UserService,
      } from "./user_query_pb";
      import { EnumRef, InputObjectRef } from "@pothos/core";
      import { getClient } from "@proto-graphql/connect-runtime";
      import { callRpc } from "@proto-graphql/connect-runtime/graphql";

      export const Address$Ref = builder.objectRef<
        MessageShape<typeof AddressSchema>
      >("Address");
      builder.objectType(Address$Ref, {
        name: "Address",
        fields: (t) => ({
          zip: t.expose("zip", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "zip", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, AddressSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.query.Address",
            name: "Address",
            package: "pothos_op_test.query",
          },
        },
      });

      export const User$Ref = builder.objectRef<MessageShape<typeof UserSchema>>(
        "User",
      );
      builder.objectType(User$Ref, {
        name: "User",
        fields: (t) => ({
          id: t.expose("id", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, UserSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.query.User",
            name: "User",
            package: "pothos_op_test.query",
          },
        },
      });

      export const GetUserRequest$Ref = builder.objectRef<
        MessageShape<typeof GetUserRequestSchema>
      >("GetUserRequest");
      builder.objectType(GetUserRequest$Ref, {
        name: "GetUserRequest",
        fields: (t) => ({
          userId: t.expose("userId", {
            type: "String",
            nullable: false,
            extensions: {
              protobufField: { name: "user_id", typeFullName: "string" },
            },
          }),
          nickname: t.expose("nickname", {
            type: "String",
            nullable: true,
            extensions: {
              protobufField: { name: "nickname", typeFullName: "string" },
            },
          }),
          address: t.expose("address", {
            type: Address$Ref,
            nullable: true,
            extensions: {
              protobufField: {
                name: "address",
                typeFullName: "pothos_op_test.query.Address",
              },
            },
          }),
          role: t.field({
            type: Role$Ref,
            nullable: true,
            resolve: (source) => {
              if (source.role === Role.UNSPECIFIED) {
                return null;
              }

              return source.role;
            },
            extensions: {
              protobufField: {
                name: "role",
                typeFullName: "pothos_op_test.query.Role",
              },
            },
          }),
          pick: t.field({
            type: GetUserRequestPick$Ref,
            nullable: true,
            resolve: (source) => {
              return (source.pick.value ?? null) as
                | Address
                | Address
                | undefined
                | null;
            },
            extensions: { protobufField: { name: "pick" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, GetUserRequestSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.query.GetUserRequest",
            name: "GetUserRequest",
            package: "pothos_op_test.query",
          },
        },
      });

      export type AddressInput$Shape = { zip: Address["zip"]; };

      export const AddressInput$Ref: InputObjectRef<AddressInput$Shape> = builder
        .inputRef<AddressInput$Shape>("AddressInput").implement({
          fields: (t) => ({
            zip: t.field({
              type: "String",
              required: true,
              extensions: { protobufField: { name: "zip", typeFullName: "string" } },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.query.Address",
              name: "Address",
              package: "pothos_op_test.query",
            },
          },
        }) as InputObjectRef<AddressInput$Shape>;

      export function AddressInput$toProto(
        input: AddressInput$Shape | null | undefined,
      ): Address {
        return create(AddressSchema, { zip: input?.zip ?? undefined });
      }

      export type UserInput$Shape = { id: User["id"]; };

      export const UserInput$Ref: InputObjectRef<UserInput$Shape> = builder.inputRef<
        UserInput$Shape
      >("UserInput").implement({
        fields: (t) => ({
          id: t.field({
            type: "String",
            required: true,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
        }),
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.query.User",
            name: "User",
            package: "pothos_op_test.query",
          },
        },
      }) as InputObjectRef<UserInput$Shape>;

      export function UserInput$toProto(
        input: UserInput$Shape | null | undefined,
      ): User {
        return create(UserSchema, { id: input?.id ?? undefined });
      }

      export type GetUserRequestInput$Shape = {
        userId: GetUserRequest["userId"];
        nickname?: GetUserRequest["nickname"] | null;
        address?: AddressInput$Shape | null;
        role?: GetUserRequest["role"] | null;
        addrA?: AddressInput$Shape | null;
        addrB?: AddressInput$Shape | null;
      };

      export const GetUserRequestInput$Ref: InputObjectRef<
        GetUserRequestInput$Shape
      > = builder.inputRef<GetUserRequestInput$Shape>("GetUserRequestInput")
        .implement({
          fields: (t) => ({
            userId: t.field({
              type: "String",
              required: true,
              extensions: {
                protobufField: { name: "user_id", typeFullName: "string" },
              },
            }),
            nickname: t.field({
              type: "String",
              required: false,
              extensions: {
                protobufField: { name: "nickname", typeFullName: "string" },
              },
            }),
            address: t.field({
              type: AddressInput$Ref,
              required: false,
              extensions: {
                protobufField: {
                  name: "address",
                  typeFullName: "pothos_op_test.query.Address",
                },
              },
            }),
            role: t.field({
              type: Role$Ref,
              required: false,
              extensions: {
                protobufField: {
                  name: "role",
                  typeFullName: "pothos_op_test.query.Role",
                },
              },
            }),
            addrA: t.field({
              type: AddressInput$Ref,
              required: false,
              extensions: {
                protobufField: {
                  name: "addr_a",
                  typeFullName: "pothos_op_test.query.Address",
                },
              },
            }),
            addrB: t.field({
              type: AddressInput$Ref,
              required: false,
              extensions: {
                protobufField: {
                  name: "addr_b",
                  typeFullName: "pothos_op_test.query.Address",
                },
              },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.query.GetUserRequest",
              name: "GetUserRequest",
              package: "pothos_op_test.query",
            },
          },
        }) as InputObjectRef<GetUserRequestInput$Shape>;

      export function GetUserRequestInput$toProto(
        input: GetUserRequestInput$Shape | null | undefined,
      ): GetUserRequest {
        return create(GetUserRequestSchema, {
          userId: input?.userId ?? undefined,
          nickname: input?.nickname ?? undefined,
          address: input?.address ? AddressInput$toProto(input.address) : undefined,
          role: input?.role ?? undefined,
          pick: input?.addrA
            ? { case: "addrA", value: AddressInput$toProto(input.addrA) }
            : input?.addrB
            ? { case: "addrB", value: AddressInput$toProto(input.addrB) }
            : undefined,
        });
      }

      export const GetUserRequestPick$Ref = builder.unionType("GetUserRequestPick", {
        types: [Address$Ref, Address$Ref],
        extensions: {
          protobufOneof: {
            fullName: "pothos_op_test.query.GetUserRequest.pick",
            name: "pick",
            messageName: "GetUserRequest",
            package: "pothos_op_test.query",
            fields: [{ name: "addr_a", type: "pothos_op_test.query.Address" }, {
              name: "addr_b",
              type: "pothos_op_test.query.Address",
            }],
          },
        },
      });

      export const Role$Ref: EnumRef<Role, Role> = builder.enumType("Role", {
        values: {
          ADMIN: {
            value: 1,
            extensions: { protobufEnumValue: { name: "ROLE_ADMIN" } },
          },
        } as const,
        extensions: {
          protobufEnum: {
            name: "Role",
            fullName: "pothos_op_test.query.Role",
            package: "pothos_op_test.query",
          },
        },
      });

      builder.queryField(
        "getUser",
        (t) =>
          t.field({
            type: User$Ref,
            nullable: false,
            args: {
              userId: t.arg({ type: "String", required: true }),
              nickname: t.arg({ type: "String", required: false }),
              address: t.arg({ type: AddressInput$Ref, required: false }),
              role: t.arg({ type: Role$Ref, required: false }),
              addrA: t.arg({ type: AddressInput$Ref, required: false }),
              addrB: t.arg({ type: AddressInput$Ref, required: false }),
            },
            resolve: async (_root, args, ctx) => {
              const client = getClient(ctx, UserService);
              const res = await callRpc(ctx, (opts) =>
                client.getUser(
                  create(GetUserRequestSchema, {
                    userId: args.userId ?? undefined,
                    nickname: args.nickname ?? undefined,
                    address: args.address
                      ? AddressInput$toProto(args.address)
                      : undefined,
                    role: args.role ?? undefined,
                    pick: args.addrA
                      ? { case: "addrA", value: AddressInput$toProto(args.addrA) }
                      : args.addrB
                      ? { case: "addrB", value: AddressInput$toProto(args.addrB) }
                      : undefined,
                  }),
                  opts,
                ));
              return res;
            },
            extensions: {
              protobufMethod: {
                name: "GetUser",
                fullName: "pothos_op_test.query.UserService.GetUser",
                service: "pothos_op_test.query.UserService",
                package: "pothos_op_test.query",
              },
            },
          }),
      );
      "
    `);
  });

  it("generates a Mutation field with a single input arg", () => {
    const pkg = "pothos_op_test.mutation";
    const file = create(FileDescriptorProtoSchema, {
      name: "user_mutation.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [
        msg("User", [
          fld("id", 1, T.STRING, OPTIONAL),
          fld("name", 2, T.STRING, OPTIONAL),
        ]),
        msg("CreateUserRequest", [fld("name", 1, T.STRING, OPTIONAL)]),
      ],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "UserService",
          method: [
            method(
              "CreateUser",
              `.${pkg}.CreateUserRequest`,
              `.${pkg}.User`,
              rpcOptions({ operation: MUTATION }),
            ),
          ],
        }),
      ],
    });

    const resp = run([file], file.name, PB_ES);
    expect(resp.error).toBeFalsy();
    expect(resp.file[0]?.content).toMatchInlineSnapshot(`
      "// @generated by protoc-gen-pothos v0.8.1 with parameter "protobuf_lib=protobuf-es"
      // @generated from file user_mutation.proto (package pothos_op_test.mutation, syntax proto3)
      /* eslint-disable */

      import { builder } from "./builder";
      import { create, isMessage, MessageShape } from "@bufbuild/protobuf";
      import {
        CreateUserRequest,
        CreateUserRequestSchema,
        User,
        UserSchema,
        UserService,
      } from "./user_mutation_pb";
      import { InputObjectRef } from "@pothos/core";
      import { getClient } from "@proto-graphql/connect-runtime";
      import { callRpc } from "@proto-graphql/connect-runtime/graphql";

      export const User$Ref = builder.objectRef<MessageShape<typeof UserSchema>>(
        "User",
      );
      builder.objectType(User$Ref, {
        name: "User",
        fields: (t) => ({
          id: t.expose("id", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
          name: t.expose("name", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "name", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, UserSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.mutation.User",
            name: "User",
            package: "pothos_op_test.mutation",
          },
        },
      });

      export const CreateUserRequest$Ref = builder.objectRef<
        MessageShape<typeof CreateUserRequestSchema>
      >("CreateUserRequest");
      builder.objectType(CreateUserRequest$Ref, {
        name: "CreateUserRequest",
        fields: (t) => ({
          name: t.expose("name", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "name", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, CreateUserRequestSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.mutation.CreateUserRequest",
            name: "CreateUserRequest",
            package: "pothos_op_test.mutation",
          },
        },
      });

      export type UserInput$Shape = { id: User["id"]; name: User["name"]; };

      export const UserInput$Ref: InputObjectRef<UserInput$Shape> = builder.inputRef<
        UserInput$Shape
      >("UserInput").implement({
        fields: (t) => ({
          id: t.field({
            type: "String",
            required: true,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
          name: t.field({
            type: "String",
            required: true,
            extensions: { protobufField: { name: "name", typeFullName: "string" } },
          }),
        }),
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.mutation.User",
            name: "User",
            package: "pothos_op_test.mutation",
          },
        },
      }) as InputObjectRef<UserInput$Shape>;

      export function UserInput$toProto(
        input: UserInput$Shape | null | undefined,
      ): User {
        return create(UserSchema, {
          id: input?.id ?? undefined,
          name: input?.name ?? undefined,
        });
      }

      export type CreateUserRequestInput$Shape = { name: CreateUserRequest["name"]; };

      export const CreateUserRequestInput$Ref: InputObjectRef<
        CreateUserRequestInput$Shape
      > = builder.inputRef<CreateUserRequestInput$Shape>("CreateUserRequestInput")
        .implement({
          fields: (t) => ({
            name: t.field({
              type: "String",
              required: true,
              extensions: { protobufField: { name: "name", typeFullName: "string" } },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.mutation.CreateUserRequest",
              name: "CreateUserRequest",
              package: "pothos_op_test.mutation",
            },
          },
        }) as InputObjectRef<CreateUserRequestInput$Shape>;

      export function CreateUserRequestInput$toProto(
        input: CreateUserRequestInput$Shape | null | undefined,
      ): CreateUserRequest {
        return create(CreateUserRequestSchema, { name: input?.name ?? undefined });
      }

      builder.mutationField(
        "createUser",
        (t) =>
          t.field({
            type: User$Ref,
            nullable: false,
            args: {
              input: t.arg({ type: CreateUserRequestInput$Ref, required: true }),
            },
            resolve: async (_root, args, ctx) => {
              const client = getClient(ctx, UserService);
              const res = await callRpc(
                ctx,
                (opts) =>
                  client.createUser(CreateUserRequestInput$toProto(args.input), opts),
              );
              return res;
            },
            extensions: {
              protobufMethod: {
                name: "CreateUser",
                fullName: "pothos_op_test.mutation.UserService.CreateUser",
                service: "pothos_op_test.mutation.UserService",
                package: "pothos_op_test.mutation",
              },
            },
          }),
      );
      "
    `);
  });

  it("unwraps expose_field returns (message and repeated message)", () => {
    const pkg = "pothos_op_test.expose";
    const file = create(FileDescriptorProtoSchema, {
      name: "address.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [
        msg("Address", [fld("zip", 1, T.STRING, OPTIONAL)]),
        msg("GetAddressRequest", [fld("user_id", 1, T.STRING, OPTIONAL)]),
        msg("GetAddressResponse", [
          fld("address", 1, T.MESSAGE, OPTIONAL, {
            typeName: `.${pkg}.Address`,
          }),
        ]),
        msg("ListAddressesRequest", []),
        msg("ListAddressesResponse", [
          fld("addresses", 1, T.MESSAGE, REPEATED, {
            typeName: `.${pkg}.Address`,
          }),
        ]),
      ],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "AddressService",
          method: [
            method(
              "GetAddress",
              `.${pkg}.GetAddressRequest`,
              `.${pkg}.GetAddressResponse`,
              rpcOptions({ operation: QUERY, exposeField: "address" }),
            ),
            method(
              "ListAddresses",
              `.${pkg}.ListAddressesRequest`,
              `.${pkg}.ListAddressesResponse`,
              rpcOptions({ operation: QUERY, exposeField: "addresses" }),
            ),
          ],
        }),
      ],
    });

    const resp = run([file], file.name, PB_ES);
    expect(resp.error).toBeFalsy();
    expect(resp.file[0]?.content).toMatchInlineSnapshot(`
      "// @generated by protoc-gen-pothos v0.8.1 with parameter "protobuf_lib=protobuf-es"
      // @generated from file address.proto (package pothos_op_test.expose, syntax proto3)
      /* eslint-disable */

      import { builder } from "./builder";
      import { create, isMessage, MessageShape } from "@bufbuild/protobuf";
      import {
        Address,
        AddressSchema,
        AddressService,
        GetAddressRequest,
        GetAddressRequestSchema,
        GetAddressResponse,
        GetAddressResponseSchema,
        ListAddressesRequest,
        ListAddressesRequestSchema,
        ListAddressesResponse,
        ListAddressesResponseSchema,
      } from "./address_pb";
      import { InputObjectRef } from "@pothos/core";
      import { getClient } from "@proto-graphql/connect-runtime";
      import { callRpc } from "@proto-graphql/connect-runtime/graphql";

      export const Address$Ref = builder.objectRef<
        MessageShape<typeof AddressSchema>
      >("Address");
      builder.objectType(Address$Ref, {
        name: "Address",
        fields: (t) => ({
          zip: t.expose("zip", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "zip", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, AddressSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.Address",
            name: "Address",
            package: "pothos_op_test.expose",
          },
        },
      });

      export const GetAddressRequest$Ref = builder.objectRef<
        MessageShape<typeof GetAddressRequestSchema>
      >("GetAddressRequest");
      builder.objectType(GetAddressRequest$Ref, {
        name: "GetAddressRequest",
        fields: (t) => ({
          userId: t.expose("userId", {
            type: "String",
            nullable: false,
            extensions: {
              protobufField: { name: "user_id", typeFullName: "string" },
            },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, GetAddressRequestSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.GetAddressRequest",
            name: "GetAddressRequest",
            package: "pothos_op_test.expose",
          },
        },
      });

      export const GetAddressResponse$Ref = builder.objectRef<
        MessageShape<typeof GetAddressResponseSchema>
      >("GetAddressResponse");
      builder.objectType(GetAddressResponse$Ref, {
        name: "GetAddressResponse",
        fields: (t) => ({
          address: t.expose("address", {
            type: Address$Ref,
            nullable: true,
            extensions: {
              protobufField: {
                name: "address",
                typeFullName: "pothos_op_test.expose.Address",
              },
            },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, GetAddressResponseSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.GetAddressResponse",
            name: "GetAddressResponse",
            package: "pothos_op_test.expose",
          },
        },
      });

      export const ListAddressesRequest$Ref = builder.objectRef<
        MessageShape<typeof ListAddressesRequestSchema>
      >("ListAddressesRequest");
      builder.objectType(ListAddressesRequest$Ref, {
        name: "ListAddressesRequest",
        fields: (t) => ({
          _: t.field({
            type: "Boolean",
            nullable: true,
            description: "noop field",
            resolve: () => true,
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, ListAddressesRequestSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.ListAddressesRequest",
            name: "ListAddressesRequest",
            package: "pothos_op_test.expose",
          },
        },
      });

      export const ListAddressesResponse$Ref = builder.objectRef<
        MessageShape<typeof ListAddressesResponseSchema>
      >("ListAddressesResponse");
      builder.objectType(ListAddressesResponse$Ref, {
        name: "ListAddressesResponse",
        fields: (t) => ({
          addresses: t.expose("addresses", {
            type: [Address$Ref],
            nullable: { list: true, items: false },
            extensions: {
              protobufField: {
                name: "addresses",
                typeFullName: "pothos_op_test.expose.Address",
              },
            },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, ListAddressesResponseSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.ListAddressesResponse",
            name: "ListAddressesResponse",
            package: "pothos_op_test.expose",
          },
        },
      });

      export type AddressInput$Shape = { zip: Address["zip"]; };

      export const AddressInput$Ref: InputObjectRef<AddressInput$Shape> = builder
        .inputRef<AddressInput$Shape>("AddressInput").implement({
          fields: (t) => ({
            zip: t.field({
              type: "String",
              required: true,
              extensions: { protobufField: { name: "zip", typeFullName: "string" } },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.expose.Address",
              name: "Address",
              package: "pothos_op_test.expose",
            },
          },
        }) as InputObjectRef<AddressInput$Shape>;

      export function AddressInput$toProto(
        input: AddressInput$Shape | null | undefined,
      ): Address {
        return create(AddressSchema, { zip: input?.zip ?? undefined });
      }

      export type GetAddressRequestInput$Shape = {
        userId: GetAddressRequest["userId"];
      };

      export const GetAddressRequestInput$Ref: InputObjectRef<
        GetAddressRequestInput$Shape
      > = builder.inputRef<GetAddressRequestInput$Shape>("GetAddressRequestInput")
        .implement({
          fields: (t) => ({
            userId: t.field({
              type: "String",
              required: true,
              extensions: {
                protobufField: { name: "user_id", typeFullName: "string" },
              },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.expose.GetAddressRequest",
              name: "GetAddressRequest",
              package: "pothos_op_test.expose",
            },
          },
        }) as InputObjectRef<GetAddressRequestInput$Shape>;

      export function GetAddressRequestInput$toProto(
        input: GetAddressRequestInput$Shape | null | undefined,
      ): GetAddressRequest {
        return create(GetAddressRequestSchema, {
          userId: input?.userId ?? undefined,
        });
      }

      export type GetAddressResponseInput$Shape = {
        address?: AddressInput$Shape | null;
      };

      export const GetAddressResponseInput$Ref: InputObjectRef<
        GetAddressResponseInput$Shape
      > = builder.inputRef<GetAddressResponseInput$Shape>("GetAddressResponseInput")
        .implement({
          fields: (t) => ({
            address: t.field({
              type: AddressInput$Ref,
              required: false,
              extensions: {
                protobufField: {
                  name: "address",
                  typeFullName: "pothos_op_test.expose.Address",
                },
              },
            }),
          }),
          extensions: {
            protobufMessage: {
              fullName: "pothos_op_test.expose.GetAddressResponse",
              name: "GetAddressResponse",
              package: "pothos_op_test.expose",
            },
          },
        }) as InputObjectRef<GetAddressResponseInput$Shape>;

      export function GetAddressResponseInput$toProto(
        input: GetAddressResponseInput$Shape | null | undefined,
      ): GetAddressResponse {
        return create(GetAddressResponseSchema, {
          address: input?.address ? AddressInput$toProto(input.address) : undefined,
        });
      }

      export type ListAddressesRequestInput$Shape = {};

      export const ListAddressesRequestInput$Ref: InputObjectRef<
        ListAddressesRequestInput$Shape
      > = builder.inputRef<ListAddressesRequestInput$Shape>(
        "ListAddressesRequestInput",
      ).implement({
        fields: (t) => ({
          _: t.field({ type: "Boolean", required: false, description: "noop field" }),
        }),
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.ListAddressesRequest",
            name: "ListAddressesRequest",
            package: "pothos_op_test.expose",
          },
        },
      }) as InputObjectRef<ListAddressesRequestInput$Shape>;

      export function ListAddressesRequestInput$toProto(
        input: ListAddressesRequestInput$Shape | null | undefined,
      ): ListAddressesRequest {
        return create(ListAddressesRequestSchema, {});
      }

      export type ListAddressesResponseInput$Shape = {
        addresses?: Array<AddressInput$Shape> | null;
      };

      export const ListAddressesResponseInput$Ref: InputObjectRef<
        ListAddressesResponseInput$Shape
      > = builder.inputRef<ListAddressesResponseInput$Shape>(
        "ListAddressesResponseInput",
      ).implement({
        fields: (t) => ({
          addresses: t.field({
            type: [AddressInput$Ref],
            required: { list: false, items: true },
            extensions: {
              protobufField: {
                name: "addresses",
                typeFullName: "pothos_op_test.expose.Address",
              },
            },
          }),
        }),
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.expose.ListAddressesResponse",
            name: "ListAddressesResponse",
            package: "pothos_op_test.expose",
          },
        },
      }) as InputObjectRef<ListAddressesResponseInput$Shape>;

      export function ListAddressesResponseInput$toProto(
        input: ListAddressesResponseInput$Shape | null | undefined,
      ): ListAddressesResponse {
        return create(ListAddressesResponseSchema, {
          addresses: input?.addresses?.map((v) => AddressInput$toProto(v)),
        });
      }

      builder.queryField(
        "getAddress",
        (t) =>
          t.field({
            type: Address$Ref,
            nullable: true,
            args: { userId: t.arg({ type: "String", required: true }) },
            resolve: async (_root, args, ctx) => {
              const client = getClient(ctx, AddressService);
              const res = await callRpc(ctx, (opts) =>
                client.getAddress(
                  create(GetAddressRequestSchema, {
                    userId: args.userId ?? undefined,
                  }),
                  opts,
                ));
              return res.address;
            },
            extensions: {
              protobufMethod: {
                name: "GetAddress",
                fullName: "pothos_op_test.expose.AddressService.GetAddress",
                service: "pothos_op_test.expose.AddressService",
                package: "pothos_op_test.expose",
              },
            },
          }),
      );

      builder.queryField(
        "listAddresses",
        (t) =>
          t.field({
            type: [Address$Ref],
            nullable: { list: true, items: false },
            resolve: async (_root, _args, ctx) => {
              const client = getClient(ctx, AddressService);
              const res = await callRpc(
                ctx,
                (opts) =>
                  client.listAddresses(create(ListAddressesRequestSchema, {}), opts),
              );
              return res.addresses;
            },
            extensions: {
              protobufMethod: {
                name: "ListAddresses",
                fullName: "pothos_op_test.expose.AddressService.ListAddresses",
                service: "pothos_op_test.expose.AddressService",
                package: "pothos_op_test.expose",
              },
            },
          }),
      );
      "
    `);
  });

  it("handles google.protobuf.Empty requests/responses and deprecated RPCs", () => {
    const pkg = "pothos_op_test.empty";
    const emptyFile = create(FileDescriptorProtoSchema, {
      name: "google/protobuf/empty.proto",
      package: "google.protobuf",
      syntax: "proto3",
      messageType: [create(DescriptorProtoSchema, { name: "Empty" })],
    });
    const file = create(FileDescriptorProtoSchema, {
      name: "ping.proto",
      package: pkg,
      syntax: "proto3",
      dependency: ["google/protobuf/empty.proto"],
      messageType: [msg("User", [fld("id", 1, T.STRING, OPTIONAL)])],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "PingService",
          method: [
            method(
              "Ping",
              ".google.protobuf.Empty",
              ".google.protobuf.Empty",
              rpcOptions({ operation: MUTATION }),
            ),
            method(
              "GetDefaultUser",
              ".google.protobuf.Empty",
              `.${pkg}.User`,
              rpcOptions({ operation: QUERY, deprecated: true }),
            ),
          ],
        }),
      ],
    });

    const resp = run([emptyFile, file], file.name, PB_ES);
    expect(resp.error).toBeFalsy();
    expect(resp.file[0]?.content).toMatchInlineSnapshot(`
      "// @generated by protoc-gen-pothos v0.8.1 with parameter "protobuf_lib=protobuf-es"
      // @generated from file ping.proto (package pothos_op_test.empty, syntax proto3)
      /* eslint-disable */

      import { builder } from "./builder";
      import { create, isMessage, MessageShape } from "@bufbuild/protobuf";
      import { PingService, User, UserSchema } from "./ping_pb";
      import { InputObjectRef } from "@pothos/core";
      import { getClient } from "@proto-graphql/connect-runtime";
      import { callRpc } from "@proto-graphql/connect-runtime/graphql";
      import { EmptySchema } from "@bufbuild/protobuf/wkt";

      export const User$Ref = builder.objectRef<MessageShape<typeof UserSchema>>(
        "User",
      );
      builder.objectType(User$Ref, {
        name: "User",
        fields: (t) => ({
          id: t.expose("id", {
            type: "String",
            nullable: false,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
        }),
        isTypeOf: (source) => {
          return isMessage(source, UserSchema);
        },
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.empty.User",
            name: "User",
            package: "pothos_op_test.empty",
          },
        },
      });

      export type UserInput$Shape = { id: User["id"]; };

      export const UserInput$Ref: InputObjectRef<UserInput$Shape> = builder.inputRef<
        UserInput$Shape
      >("UserInput").implement({
        fields: (t) => ({
          id: t.field({
            type: "String",
            required: true,
            extensions: { protobufField: { name: "id", typeFullName: "string" } },
          }),
        }),
        extensions: {
          protobufMessage: {
            fullName: "pothos_op_test.empty.User",
            name: "User",
            package: "pothos_op_test.empty",
          },
        },
      }) as InputObjectRef<UserInput$Shape>;

      export function UserInput$toProto(
        input: UserInput$Shape | null | undefined,
      ): User {
        return create(UserSchema, { id: input?.id ?? undefined });
      }

      builder.mutationField(
        "ping",
        (t) =>
          t.field({
            type: "Boolean",
            nullable: false,
            resolve: async (_root, _args, ctx) => {
              const client = getClient(ctx, PingService);
              await callRpc(ctx, (opts) => client.ping(create(EmptySchema), opts));
              return true;
            },
            extensions: {
              protobufMethod: {
                name: "Ping",
                fullName: "pothos_op_test.empty.PingService.Ping",
                service: "pothos_op_test.empty.PingService",
                package: "pothos_op_test.empty",
              },
            },
          }),
      );

      builder.queryField(
        "getDefaultUser",
        (t) =>
          t.field({
            type: User$Ref,
            nullable: false,
            resolve: async (_root, _args, ctx) => {
              const client = getClient(ctx, PingService);
              const res = await callRpc(
                ctx,
                (opts) => client.getDefaultUser(create(EmptySchema), opts),
              );
              return res;
            },
            extensions: {
              protobufMethod: {
                name: "GetDefaultUser",
                fullName: "pothos_op_test.empty.PingService.GetDefaultUser",
                service: "pothos_op_test.empty.PingService",
                package: "pothos_op_test.empty",
              },
            },
            deprecationReason:
              "pothos_op_test.empty.PingService.GetDefaultUser is mark as deprecated in a *.proto file.",
          }),
      );
      "
    `);
  });

  it("silently skips an unannotated streaming RPC (no warning, Q31)", () => {
    const pkg = "pothos_op_test.streaming";
    const file = create(FileDescriptorProtoSchema, {
      name: "watch.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [msg("Item", [fld("id", 1, T.STRING, OPTIONAL)])],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "WatchService",
          method: [
            method("Watch", `.${pkg}.Item`, `.${pkg}.Item`, rpcOptions({}), {
              server: true,
            }),
          ],
        }),
      ],
    });

    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    const resp = run([file], file.name, PB_ES);

    expect(resp.error).toBeFalsy();
    // Q31: an unannotated RPC — streaming or not — is simply unexposed;
    // there is no longer a warning channel for this case.
    expect(stderr).not.toHaveBeenCalled();
    // Types are still generated; no operation is emitted.
    expect(resp.file[0]?.content).toContain("Item$Ref");
    expect(resp.file[0]?.content).not.toContain("queryField");
    expect(resp.file[0]?.content).not.toContain("mutationField");
  });

  it("honors the runtime_module plugin param", () => {
    const pkg = "pothos_op_test.runtime";
    const file = create(FileDescriptorProtoSchema, {
      name: "runtime.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [
        msg("User", [fld("id", 1, T.STRING, OPTIONAL)]),
        msg("GetUserRequest", [fld("user_id", 1, T.STRING, OPTIONAL)]),
      ],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "UserService",
          method: [
            method(
              "GetUser",
              `.${pkg}.GetUserRequest`,
              `.${pkg}.User`,
              rpcOptions({ operation: QUERY }),
            ),
          ],
        }),
      ],
    });

    const resp = run(
      [file],
      file.name,
      `${PB_ES},runtime_module=@acme/runtime`,
    );
    expect(resp.error).toBeFalsy();
    const content = resp.file[0]?.content ?? "";
    expect(content).toContain('from "@acme/runtime"');
    expect(content).toContain('from "@acme/runtime/graphql"');
  });

  it("fails when a streaming RPC sets an explicit operation", () => {
    const pkg = "pothos_op_test.streaming_err";
    const file = create(FileDescriptorProtoSchema, {
      name: "watch_err.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [msg("Item", [fld("id", 1, T.STRING, OPTIONAL)])],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "WatchService",
          method: [
            method(
              "Watch",
              `.${pkg}.Item`,
              `.${pkg}.Item`,
              rpcOptions({ operation: QUERY }),
              { server: true },
            ),
          ],
        }),
      ],
    });

    expect(() =>
      run([file], file.name, PB_ES),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: (graphql.rpc).operation is set on WatchService.Watch, but WatchService.Watch is a server_streaming RPC. Streaming RPCs cannot be mapped to a GraphQL Query/Mutation. Remove the operation option, or set (graphql.rpc).ignore = true to exclude this RPC.]`,
    );
  });

  it("errors when (graphql.rpc).operation is used without protobuf_lib=protobuf-es", () => {
    const pkg = "pothos_op_test.guard";
    const file = create(FileDescriptorProtoSchema, {
      name: "guard.proto",
      package: pkg,
      syntax: "proto3",
      messageType: [
        msg("User", [fld("id", 1, T.STRING, OPTIONAL)]),
        msg("GetUserRequest", [fld("user_id", 1, T.STRING, OPTIONAL)]),
      ],
      service: [
        create(ServiceDescriptorProtoSchema, {
          name: "UserService",
          method: [
            method(
              "GetUser",
              `.${pkg}.GetUserRequest`,
              `.${pkg}.User`,
              rpcOptions({ operation: QUERY }),
            ),
          ],
        }),
      ],
    });

    // Default runtime is ts-proto (no protobuf_lib param).
    expect(() => run([file], file.name, "")).toThrowErrorMatchingInlineSnapshot(
      `[Error: guard: (graphql.rpc).operation requires protobuf_lib=protobuf-es (protobuf-es v2), but protobuf_lib=ts-proto. RPC-to-Query/Mutation generation only supports protobuf-es v2 (Connect-ES v2). Remove (graphql.rpc).operation from the file's RPCs, or switch the plugin to protobuf_lib=protobuf-es.]`,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
