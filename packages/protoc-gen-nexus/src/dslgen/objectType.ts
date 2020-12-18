import ts from "typescript";
import { ProtoField, ProtoMessage, ProtoRegistry } from "../protoTypes";
import {
  createDslExportConstStmt,
  gqlTypeName,
  protoExportAlias,
} from "./util";
import { detectGqlType, GqlType, nexusFieldFuncName } from "./types";
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
    ts.factory.createCallExpression(createFieldFunctionExpr(type), undefined, [
      ts.factory.createStringLiteral(field.name),
      createFieldOptionExpr(field, type),
    ])
  );
}

/**
 * @example
 * ```ts
 * t.nonNull.string
 * ```
 */
function createFieldFunctionExpr(type: GqlType): ts.Expression {
  let left: ts.Expression = ts.factory.createIdentifier("t");

  left = ts.factory.createPropertyAccessExpression(
    left,
    ts.factory.createIdentifier(type.nullable ? "nullable" : "nonNull")
  );

  if (type.kind === "list") {
    left = ts.factory.createPropertyAccessExpression(
      left,
      ts.factory.createIdentifier("list")
    );
  }

  return ts.factory.createPropertyAccessExpression(
    left,
    ts.factory.createIdentifier(nexusFieldFuncName(type))
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
  const props: ts.ObjectLiteralElementLike[] = [
    ts.factory.createPropertyAssignment(
      "description",
      ts.factory.createStringLiteral(field.description)
    ),
  ];

  if (type.kind === "list") {
    props.push(
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createStringLiteral(type.type.type)
      )
    );
  }

  if (type.kind === "object" || type.kind === "enum") {
    props.push(
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createStringLiteral(type.type)
      )
    );
  }

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

  props.push(
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
    )
  );

  return ts.factory.createObjectLiteralExpression(props, true);
}
