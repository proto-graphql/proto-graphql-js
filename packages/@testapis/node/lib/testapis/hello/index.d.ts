import * as $protobuf from "protobufjs";
/** Namespace testapis. */
export namespace testapis {

    /** Namespace hello. */
    namespace hello {

        /** Properties of a Hello. */
        interface IHello {

            /** Hello requiredPrimitives */
            requiredPrimitives?: (testapis.hello.IPrimitives|null);

            /** Hello optionalPrimitives */
            optionalPrimitives?: (testapis.hello.IPrimitives|null);

            /** Hello requiredPrimitivesList */
            requiredPrimitivesList?: (testapis.hello.IPrimitives[]|null);

            /** Hello optionalPrimitivesList */
            optionalPrimitivesList?: (testapis.hello.IPrimitives|null);
        }

        /** Represents a Hello. */
        class Hello implements IHello {

            /**
             * Constructs a new Hello.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.hello.IHello);

            /** Hello requiredPrimitives. */
            public requiredPrimitives?: (testapis.hello.IPrimitives|null);

            /** Hello optionalPrimitives. */
            public optionalPrimitives?: (testapis.hello.IPrimitives|null);

            /** Hello requiredPrimitivesList. */
            public requiredPrimitivesList: testapis.hello.IPrimitives[];

            /** Hello optionalPrimitivesList. */
            public optionalPrimitivesList?: (testapis.hello.IPrimitives|null);

            /**
             * Creates a new Hello instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Hello instance
             */
            public static create(properties?: testapis.hello.IHello): testapis.hello.Hello;

            /**
             * Encodes the specified Hello message. Does not implicitly {@link testapis.hello.Hello.verify|verify} messages.
             * @param message Hello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.hello.IHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Hello message, length delimited. Does not implicitly {@link testapis.hello.Hello.verify|verify} messages.
             * @param message Hello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.hello.IHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Hello message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Hello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.hello.Hello;

            /**
             * Decodes a Hello message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Hello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.hello.Hello;

            /**
             * Verifies a Hello message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Hello message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Hello
             */
            public static fromObject(object: { [k: string]: any }): testapis.hello.Hello;

            /**
             * Creates a plain object from a Hello message. Also converts values to other types if specified.
             * @param message Hello
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.hello.Hello, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Hello to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Primitives. */
        interface IPrimitives {

            /** Primitives requiredDoubleValue */
            requiredDoubleValue?: (number|null);

            /** Primitives requiredFloatValue */
            requiredFloatValue?: (number|null);

            /** Primitives requiredInt32Value */
            requiredInt32Value?: (number|null);

            /** Primitives requiredInt64Value */
            requiredInt64Value?: (number|Long|null);

            /** Primitives requiredUint32Value */
            requiredUint32Value?: (number|null);

            /** Primitives requiredUint64Value */
            requiredUint64Value?: (number|Long|null);

            /** Primitives requiredSint32Value */
            requiredSint32Value?: (number|null);

            /** Primitives requiredSint64Value */
            requiredSint64Value?: (number|Long|null);

            /** Primitives requiredFixed32Value */
            requiredFixed32Value?: (number|null);

            /** Primitives requiredFixed64Value */
            requiredFixed64Value?: (number|Long|null);

            /** Primitives requiredSfixed32Value */
            requiredSfixed32Value?: (number|null);

            /** Primitives requiredSfixed64Value */
            requiredSfixed64Value?: (number|Long|null);

            /** Primitives requiredBoolValue */
            requiredBoolValue?: (boolean|null);

            /** Primitives requiredStringValue */
            requiredStringValue?: (string|null);
        }

        /** Represents a Primitives. */
        class Primitives implements IPrimitives {

            /**
             * Constructs a new Primitives.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.hello.IPrimitives);

            /** Primitives requiredDoubleValue. */
            public requiredDoubleValue: number;

            /** Primitives requiredFloatValue. */
            public requiredFloatValue: number;

            /** Primitives requiredInt32Value. */
            public requiredInt32Value: number;

            /** Primitives requiredInt64Value. */
            public requiredInt64Value: (number|Long);

            /** Primitives requiredUint32Value. */
            public requiredUint32Value: number;

            /** Primitives requiredUint64Value. */
            public requiredUint64Value: (number|Long);

            /** Primitives requiredSint32Value. */
            public requiredSint32Value: number;

            /** Primitives requiredSint64Value. */
            public requiredSint64Value: (number|Long);

            /** Primitives requiredFixed32Value. */
            public requiredFixed32Value: number;

            /** Primitives requiredFixed64Value. */
            public requiredFixed64Value: (number|Long);

            /** Primitives requiredSfixed32Value. */
            public requiredSfixed32Value: number;

            /** Primitives requiredSfixed64Value. */
            public requiredSfixed64Value: (number|Long);

            /** Primitives requiredBoolValue. */
            public requiredBoolValue: boolean;

            /** Primitives requiredStringValue. */
            public requiredStringValue: string;

            /**
             * Creates a new Primitives instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Primitives instance
             */
            public static create(properties?: testapis.hello.IPrimitives): testapis.hello.Primitives;

            /**
             * Encodes the specified Primitives message. Does not implicitly {@link testapis.hello.Primitives.verify|verify} messages.
             * @param message Primitives message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.hello.IPrimitives, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Primitives message, length delimited. Does not implicitly {@link testapis.hello.Primitives.verify|verify} messages.
             * @param message Primitives message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.hello.IPrimitives, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Primitives message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Primitives
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.hello.Primitives;

            /**
             * Decodes a Primitives message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Primitives
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.hello.Primitives;

            /**
             * Verifies a Primitives message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Primitives message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Primitives
             */
            public static fromObject(object: { [k: string]: any }): testapis.hello.Primitives;

            /**
             * Creates a plain object from a Primitives message. Also converts values to other types if specified.
             * @param message Primitives
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.hello.Primitives, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Primitives to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
