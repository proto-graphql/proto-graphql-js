import ts from "typescript";
import { ProtoMessage, ProtoRegistry } from "../protoTypes";
import {
  createDslExportConstStmt,
  exceptRequestOrResponse,
  gqlTypeName,
  isIgnoredField,
  isIgnoredType,
  isOutputOnlyField,
} from "./util";
import { createFieldDefinitionStmt } from "./field";
import { GenerationParams } from "./types";

/**
 * @example
 * ```ts
 * export cosnt HelloInput = inputObjectType({
 *   name: "HelloInput",
 *   // ...
 * })
 * ```
 */
export function createInputObjectTypeDslStmts(
  msgs: ReadonlyArray<ProtoMessage>,
  reg: ProtoRegistry,
  opts: GenerationParams
): ts.Statement[] {
  return msgs
    .filter((m) => !isIgnoredType(m, { input: true }))
    .filter(exceptRequestOrResponse(reg))
    .map((m) => createInputObjectTypeDslStmt(m, reg, opts));
}

/**
 * @example
 * ```ts
 * export cosnt Hello = inputObjectType({
 *   name: "HelloInput",
 *   // ...
 * })
 * ```
 */
function createInputObjectTypeDslStmt(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: GenerationParams
): ts.Statement {
  const typeName = `${gqlTypeName(msg)}Input`;
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(
      ts.factory.createIdentifier("inputObjectType"),
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
            createInputObjectTypeDefinitionMethodDecl(msg, reg, opts),
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
function createInputObjectTypeDefinitionMethodDecl(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: GenerationParams
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
      msg.fields
        .filter((f) => !isOutputOnlyField(f))
        .filter((f) => !isIgnoredField(f, { input: true }))
        .map((f) =>
          createFieldDefinitionStmt(f, reg, { ...opts, input: true })
        ),
      true
    )
  );
}
