import { camelCase } from "change-case";
import path from "path";
import { ProtoOneof } from "../../protogen";
import { FullName, GenerationParams, isRequiredField, modulesWithUniqueImportAlias, uniqueImportAlias } from "./util";
import { FieldBase } from "./FieldBase";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";

export class ObjectOneofField extends FieldBase<ProtoOneof> {
  constructor(
    readonly type: OneofUnionType,
    private readonly parent: ObjectType,
    proto: ProtoOneof,
    opts: GenerationParams
  ) {
    super(proto, opts);
  }

  /**
   * @override
   */
  get name(): string {
    return camelCase(this.proto.name);
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
  get protoJsName(): string {
    return camelCase(this.proto.name);
  }

  /**
   * @override
   */
  public shouldNullCheck(): boolean {
    return false;
  }

  /**
   * @override
   */
  get importModules(): { alias: string; module: string }[] {
    const modules = [];
    if (this.typeImportPath) {
      modules.push(this.typeImportPath);
    }

    return modulesWithUniqueImportAlias(modules);
  }

  get typeFullName(): FullName {
    if (!this.typeImportPath) {
      return this.type.typeName;
    }
    return [uniqueImportAlias(this.typeImportPath), this.type.typeName];
  }

  private get typeImportPath(): string | null {
    if (this.parent.filename === this.type.filename) return null;

    const [from, to] = [this.parent.filename, this.type.filename].map((f) =>
      path.isAbsolute(f) ? `.${path.sep}${f}` : f
    );
    const result = path.relative(path.dirname(from), to).replace(/\.ts$/, "");
    return result.match(/^[\.\/]/) ? result : `./${result}`;
  }
}
