import ts from "typescript";
import { ProtoField, ProtoMessage, ProtoRegistry } from "../protoTypes";
import {
  createDslExportConstStmt,
  gqlTypeName,
  protoExportAlias,
} from "./util";
import { detectGqlType, GqlType } from "./types";
import { getUnwrapFunc } from "./unwrap";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeDslStmts(
  msgs: ReadonlyArray<ProtoMessage>,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement[] {
  return msgs.map((m) => createObjectTypeDslStmt(m, reg, opts));
}

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
function createObjectTypeDslStmt(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement {
  const typeName = gqlTypeName(msg);
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(
      ts.factory.createIdentifier("objectType"),
      undefined,
      [
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "name",
              ts.factory.createStringLiteral(typeName)
            ),
            ts.factory.createPropertyAssignment(
              "description",
              ts.factory.createStringLiteral(msg.description)
            ),
            createObjectTypeDefinitionMethodDecl(msg, reg),
            ts.factory.createPropertyAssignment(
              "sourceType",
              sourceTypeExpr(msg, opts)
            ),
          ],
          true
        ),
      ]
    )
  );
}

/**
 * @example
 * ```ts
 * definition(t) {
 *   // ...
 * }
 * ```
 */
function createObjectTypeDefinitionMethodDecl(
  msg: ProtoMessage,
  reg: ProtoRegistry
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "definition",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "t",
        undefined,
        undefined,
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      msg.fields.map((f) => createFieldDefinitionStmt(f, reg)),
      true
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   module: __filename,
 *   export: "_$hello$hello_pb$User"
 * }
 * ```
 */
function sourceTypeExpr(
  msg: ProtoMessage,
  opts: { importPrefix?: string }
): ts.Expression {
  return ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment(
      "module",
      ts.factory.createIdentifier("__filename")
    ),
    ts.factory.createPropertyAssignment(
      "export",
      ts.factory.createStringLiteral(protoExportAlias(msg, opts))
    ),
  ]);
}

/**
 * @example
 * ```ts
 * t.nonNull.string("name", {
 *   // ...
 * })
 * ```
 */
function createFieldDefinitionStmt(
  field: ProtoField,
  registry: ProtoRegistry
): ts.Statement {
  const type = detectGqlType(field, registry);
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("t"),
        ts.factory.createIdentifier("field")
      ),
      undefined,
      [
        ts.factory.createStringLiteral(field.name),
        createFieldOptionExpr(field, type),
      ]
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   description: '...',
 *   type: '...',
 *   resolve(root) {
 *     // ...
 *   }
 * }
 * ```
 */
function createFieldOptionExpr(
  field: ProtoField,
  type: GqlType
): ts.Expression {
  const createTypeSpecifier = (type: GqlType): ts.Expression => {
    switch (type.kind) {
      case "list":
        return ts.factory.createCallExpression(
          ts.factory.createIdentifier("list"),
          undefined,
          [createTypeSpecifier(type.type)]
        );
      case "object":
      case "scalar":
      case "enum":
        return ts.factory.createCallExpression(
          ts.factory.createIdentifier(type.nullable ? "nullable" : "nonNull"),
          undefined,
          [ts.factory.createStringLiteral(type.type)]
        );
      default:
        const _exhaustiveCheck: never = type; // eslint-disable-line
        throw "unreachable";
    }
  };

  let resolverRet: ts.Expression = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("root"),
      ts.factory.createIdentifier(field.getterName)
    ),
    undefined,
    undefined
  );
  if (type.kind === "object") {
    if (type.nullable) {
      resolverRet = ts.factory.createBinaryExpression(
        resolverRet,
        ts.SyntaxKind.QuestionQuestionToken,
        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
      );
    } else {
      resolverRet = ts.factory.createNonNullExpression(resolverRet);
    }
  }

  const unwrapFunc = getUnwrapFunc(field);
  if (unwrapFunc !== null) {
    resolverRet = ts.factory.createCallExpression(
      ts.factory.createIdentifier(unwrapFunc.name),
      undefined,
      [resolverRet]
    );
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", createTypeSpecifier(type)),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(field.description)
      ),
      ts.factory.createMethodDeclaration(
        undefined,
        undefined,
        undefined,
        "resolve",
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "root",
            undefined,
            undefined,
            undefined
          ),
        ],
        undefined,
        ts.factory.createBlock([ts.factory.createReturnStatement(resolverRet)])
      ),
    ],
    true
  );
}
