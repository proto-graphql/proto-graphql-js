import { ProtoField, ProtoOneof } from "@proto-graphql/proto-descriptors";
import assert from "assert";
import { camelCase } from "change-case";
import path from "path";
import ts from "typescript";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";
import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import { FullName, GenerationParams, isRequiredField, modulesWithUniqueImportAlias, uniqueImportAlias } from "./util";

export class ObjectField<
  T extends ObjectType | InterfaceType | SquashedOneofUnionType | EnumType | ScalarType
> extends FieldBase<ProtoField> {
  constructor(
    readonly type: T,
    private readonly parent: ObjectType | OneofUnionType,
    proto: ProtoField,
    opts: GenerationParams
  ) {
    super(proto, opts);
  }

  /**
   * @override
   */
  get name(): string {
    return this.proto.descriptor.getOptions()?.getExtension(extensions.field)?.getName() || this.proto.jsonName;
  }

  /**
   * @override
   */
  get protoJsName(): string {
    if (this.opts.useProtobufjs) return camelCase(this.proto.name);
    return this.proto.jsonName;
  }

  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "output");
  }

  /**
   * @override
   */
  get importModules(): { alias: string; module: string }[] {
    const modules = [];
    if (this.type instanceof EnumType && this.type.unspecifiedValue != null) {
      modules.push(this.type.protoImportPath);
    }
    if (this.type instanceof SquashedOneofUnionType && !this.opts.useProtobufjs) {
      modules.push(this.type.protoImportPath);
    }
    if (this.typeImportPath) {
      modules.push(this.typeImportPath);
    }
    return modulesWithUniqueImportAlias(modules);
  }

  /**
   * @override
   */
  public shouldNullCheck(): boolean {
    if (this.proto.list) return false;
    if (this.opts.useProtobufjs) return true;
    if (this.type instanceof ScalarType && this.type.isPrimitive()) return false;

    return true;
  }

  get typeFullName(): FullName | null {
    if (this.type instanceof ScalarType) return null;
    if (!this.typeImportPath) {
      return this.type.typeName;
    }
    return [uniqueImportAlias(this.typeImportPath), this.type.typeName];
  }

  private get typeImportPath(): string | null {
    const type: ObjectType | InterfaceType | SquashedOneofUnionType | EnumType | ScalarType = this.type;

    if (type instanceof ScalarType) return type.importPath;
    if (this.parent.filename === type.filename) return null;

    const [from, to] = [this.parent.filename, type.filename].map((f) => (path.isAbsolute(f) ? `.${path.sep}${f}` : f));
    const result = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
    return result.match(/^[\.\/]/) ? result : `./${result}`;
  }

  public getProtoFieldAccessExpr(parentExpr: ts.Expression): ts.Expression {
    const proto: ProtoField | ProtoOneof = this.proto;
    assert.strictEqual(proto.kind, "Field");

    let expr: ts.Expression = ts.factory.createPropertyAccessExpression(
      parentExpr,
      ts.factory.createIdentifier(this.opts.useProtobufjs ? this.protoJsName : proto.googleProtobufGetterName)
    );
    if (!this.opts.useProtobufjs) {
      expr = ts.factory.createCallExpression(expr, undefined, undefined);
    }
    return expr;
  }
}
