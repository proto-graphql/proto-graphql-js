import { camelCase } from "change-case";
import path from "path";
import { ProtoField } from "../../protogen";
import * as extensions from "../../__generated__/extensions/graphql/schema_pb";
import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InputObjectType } from "./InputObjectType";
import { ScalarType } from "./ScalarType";
import { FullName, GenerationParams, modulesWithUniqueImportAlias, uniqueImportAlias } from "./util";

export class InputObjectField<T extends ScalarType | EnumType | InputObjectType> extends FieldBase<ProtoField> {
  constructor(readonly type: T, readonly parent: InputObjectType, proto: ProtoField, opts: GenerationParams) {
    super(proto, opts);
  }

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
  public shouldNullCheck(): boolean {
    throw "unreachable";
  }

  get protoSetterType(): "method" | "property" {
    return this.opts.useProtobufjs ? "property" : "method";
  }

  get protoSetterNameForGoogleProtobuf(): string {
    return this.proto.googleProtobufSetterName;
  }

  get importModules(): { alias: string; module: string }[] {
    const modules = [];
    if (this.typeImportPath) {
      modules.push(this.typeImportPath);
    }
    return modulesWithUniqueImportAlias(modules);
  }

  get typeFullName(): T extends ScalarType ? FullName | null : FullName {
    if (this.type instanceof ScalarType) {
      if (!this.opts.useProtobufjs) return null as any;

      const fn = this.type.protoTypeFullName;
      if (!fn) return null as any;

      let file: string;
      {
        const parentType = this.parent.protoTypeFullName;
        let parent = parentType[0];
        for (;;) {
          if (typeof parent[0] === "string") {
            file = parent[0];
            break;
          }
          parent = parent[0];
        }
      }

      {
        let parent = fn[0];
        for (;;) {
          if (Array.isArray(parent) && typeof parent[0] === "string") {
            parent.splice(0, 1, file);
            break;
          }
          parent = parent[0];
        }
      }

      return fn as any;
    }
    if (!this.typeImportPath) {
      return this.type.typeName as FullName as any;
    }
    return [uniqueImportAlias(this.typeImportPath), this.type.typeName] as FullName as any;
  }

  private get typeImportPath(): string | null {
    const type: InputObjectType | EnumType | ScalarType = this.type;

    if (type instanceof ScalarType) return type.importPath;
    if (this.parent.filename === type.filename) return null;

    const [from, to] = [this.parent.filename, type.filename].map((f) => (path.isAbsolute(f) ? `.${path.sep}${f}` : f));
    const result = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
    return result.match(/^[\.\/]/) ? result : `./${result}`;
  }

  public toPartialInput(): InputObjectField<T> | PartialInputObjectField<T> {
    if (this.type instanceof InputObjectType) {
      return new PartialInputObjectField(
        (this.type.hasPartialInput() ? this.type.toPartialInput() : this.type) as any,
        this.parent,
        this.proto,
        this.opts
      );
    }
    return new PartialInputObjectField(this.type, this.parent, this.proto, this.opts);
  }
}

class PartialInputObjectField<T extends ScalarType | EnumType | InputObjectType> extends InputObjectField<T> {
  public override isNullable() {
    return true;
  }
}
