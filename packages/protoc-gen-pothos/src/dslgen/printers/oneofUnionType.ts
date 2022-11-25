import { OneofUnionType, SquashedOneofUnionType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import {
  createBuilderCallExpr,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = builder.unionType("Oneof", {
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeDslStmt(type: OneofUnionType | SquashedOneofUnionType): ts.Statement {
  return createDslExportConstStmt(
    type.pothosRefObjectName,
    createBuilderCallExpr("unionType", [
      ts.factory.createStringLiteral(type.typeName),
      ts.factory.createObjectLiteralExpression(
        [
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "types",
            ts.factory.createArrayLiteralExpression(
              type.fields.map((f) => ts.factory.createIdentifier(f.type.pothosRefObjectName)),
              true
            )
          ),
          ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}

/**
 * @example
 * ```ts
 * {
 *   protobufMessage: {
 *     fullName: "...",
 *     name: "...",
 *     package: "...",
 *   },
 * }
 * ```
 */
function createExtensionsObjectLiteralExpr(type: OneofUnionType | SquashedOneofUnionType): ts.Expression {
  if (type instanceof SquashedOneofUnionType) {
    return ts.factory.createObjectLiteralExpression(
      [
        ts.factory.createPropertyAssignment(
          "protobufMessage",
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createPropertyAssignment(
                "fullName",
                ts.factory.createStringLiteral(type.proto.fullName.toString())
              ),
              ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.proto.name)),
              ts.factory.createPropertyAssignment("package", ts.factory.createStringLiteral(type.proto.file.package)),
              ts.factory.createPropertyAssignment(
                "fields",
                ts.factory.createArrayLiteralExpression(
                  type.proto.oneofs[0].fields.map((f) =>
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(f.name)),
                        ...(f.type && f.type.kind !== "Scalar"
                          ? [
                              ts.factory.createPropertyAssignment(
                                "type",
                                ts.factory.createStringLiteral(f.type.fullName.toString())
                              ),
                            ]
                          : []),
                      ],
                      true
                    )
                  ),
                  true
                )
              ),
            ],
            true
          )
        ),
      ],
      true
    );
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufOneof",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "fullName",
              ts.factory.createStringLiteral(type.proto.fullName.toString())
            ),
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.proto.name)),
            ts.factory.createPropertyAssignment("messageName", ts.factory.createStringLiteral(type.proto.parent.name)),
            ts.factory.createPropertyAssignment(
              "package",
              ts.factory.createStringLiteral(type.proto.parent.file.package)
            ),
            ts.factory.createPropertyAssignment(
              "fields",
              ts.factory.createArrayLiteralExpression(
                type.proto.fields.map((f) =>
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(f.name)),
                      ...(f.type && f.type.kind !== "Scalar"
                        ? [
                            ts.factory.createPropertyAssignment(
                              "type",
                              ts.factory.createStringLiteral(f.type.fullName.toString())
                            ),
                          ]
                        : []),
                    ],
                    true
                  )
                ),
                true
              )
            ),
          ],
          true
        )
      ),
    ],
    true
  );
}
