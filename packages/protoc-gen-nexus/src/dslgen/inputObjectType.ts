import ts from "typescript";
import { ProtoMessage, ProtoRegistry } from "../protogen";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  exceptRequestOrResponse,
  gqlTypeName,
  isIgnoredField,
  isIgnoredType,
  isOutputOnlyField,
  onlyNonNull,
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
    .filter((m) => !isIgnoredType(m))
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
function createInputObjectTypeDslStmt(msg: ProtoMessage, reg: ProtoRegistry, opts: GenerationParams): ts.Statement {
  const typeName = `${gqlTypeName(msg)}Input`;
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(ts.factory.createIdentifier("inputObjectType"), undefined, [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(typeName)),
          createDescriptionPropertyAssignment(msg),
          createInputObjectTypeDefinitionMethodDecl(msg, reg, opts),
        ].filter(onlyNonNull()),
        true
      ),
    ])
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
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createBlock(
      msg.fields
        .filter((f) => !isOutputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((f) => createFieldDefinitionStmt(f, reg, { ...opts, input: true })),
      true
    )
  );
}
