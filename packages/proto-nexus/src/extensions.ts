export type ProtobufMessageExtensions = {
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
};

export type ProtobufFieldExtensions = {
  protobufField: {
    /**
     * @example
     * `"foo"`
     */
    name: string;
  };
};

export type ProtobufEnumExtensions = {
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
};

export type ProtobufEnumValueExtensions = {
  protobufEnumValue: {
    /**
     * @example
     * `"FOO"`
     */
    name: string;
  };
};

export type ProtobufOneofExtensions = {
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
    };
  };
};
