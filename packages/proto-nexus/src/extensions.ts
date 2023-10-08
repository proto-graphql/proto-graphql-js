export interface ProtobufMessageExtensions {
  protobufMessage: {
    /**
     * @example
     * `"Baz"`
     */
    name: string;
    /**
     * @example
     * `"foo.bar.Baz"`
     */
    fullName: string;
    /**
     * @example
     * `"foo.bar"`
     */
    package: string;
  };
}

export interface ProtobufFieldExtensions {
  protobufField: {
    /**
     * @example
     * `"foo"`
     */
    name: string;
  };
}

export interface ProtobufEnumExtensions {
  protobufEnum: {
    /**
     * @example
     * `"Baz"`
     */
    name: string;
    /**
     * @example
     * `"foo.bar.Baz"`
     */
    fullName: string;
    /**
     * @example
     * `"foo.bar"`
     */
    package: string;
  };
}

export interface ProtobufEnumValueExtensions {
  protobufEnumValue: {
    /**
     * @example
     * `"FOO"`
     */
    name: string;
  };
}

export interface ProtobufOneofExtensions {
  protobufOneof: {
    /**
     * @example
     * `"baz"`
     */
    name: string;
    /**
     * @example
     * `"foo.Bar.baz"`
     */
    fullName: string;
    /**
     * @example
     * `"foo.Bar"`
     */
    messageName: string;
    /**
     * @example
     * `"foo"`
     */
    package: string;

    fields: {
      /**
       * @example
       * `"foo"`
       */
      name: string;
      /**
       * @example
       * `"foo.bar.Baz"`
       */
      type: string;
    }[];
  };
}
