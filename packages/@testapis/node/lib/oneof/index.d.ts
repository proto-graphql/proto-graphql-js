import * as $protobuf from "protobufjs";
/** Namespace testapi. */
export namespace testapi {

    /** Namespace oneof. */
    namespace oneof {

        /** Properties of an OneofParent. */
        interface IOneofParent {

            /** OneofParent normalField */
            normalField?: (string|null);

            /** OneofParent requiredMessage1 */
            requiredMessage1?: (testapi.oneof.IOneofMemberMessage1|null);

            /** OneofParent requiredMessage2 */
            requiredMessage2?: (testapi.oneof.IOneofMemberMessage2|null);

            /** OneofParent optoinalMessage1 */
            optoinalMessage1?: (testapi.oneof.IOneofMemberMessage1|null);

            /** OneofParent optoinalMessage2 */
            optoinalMessage2?: (testapi.oneof.IOneofMemberMessage2|null);
        }

        /** Represents an OneofParent. */
        class OneofParent implements IOneofParent {

            /**
             * Constructs a new OneofParent.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.oneof.IOneofParent);

            /** OneofParent normalField. */
            public normalField: string;

            /** OneofParent requiredMessage1. */
            public requiredMessage1?: (testapi.oneof.IOneofMemberMessage1|null);

            /** OneofParent requiredMessage2. */
            public requiredMessage2?: (testapi.oneof.IOneofMemberMessage2|null);

            /** OneofParent optoinalMessage1. */
            public optoinalMessage1?: (testapi.oneof.IOneofMemberMessage1|null);

            /** OneofParent optoinalMessage2. */
            public optoinalMessage2?: (testapi.oneof.IOneofMemberMessage2|null);

            /** OneofParent requiredOneofMembers. */
            public requiredOneofMembers?: ("requiredMessage1"|"requiredMessage2");

            /** OneofParent optionalOneofMembers. */
            public optionalOneofMembers?: ("optoinalMessage1"|"optoinalMessage2");

            /**
             * Creates a new OneofParent instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofParent instance
             */
            public static create(properties?: testapi.oneof.IOneofParent): testapi.oneof.OneofParent;

            /**
             * Encodes the specified OneofParent message. Does not implicitly {@link testapi.oneof.OneofParent.verify|verify} messages.
             * @param message OneofParent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.oneof.IOneofParent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofParent message, length delimited. Does not implicitly {@link testapi.oneof.OneofParent.verify|verify} messages.
             * @param message OneofParent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.oneof.IOneofParent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofParent message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofParent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.oneof.OneofParent;

            /**
             * Decodes an OneofParent message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofParent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.oneof.OneofParent;

            /**
             * Verifies an OneofParent message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofParent message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofParent
             */
            public static fromObject(object: { [k: string]: any }): testapi.oneof.OneofParent;

            /**
             * Creates a plain object from an OneofParent message. Also converts values to other types if specified.
             * @param message OneofParent
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.oneof.OneofParent, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofParent to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an OneofMemberMessage1. */
        interface IOneofMemberMessage1 {

            /** OneofMemberMessage1 body */
            body?: (string|null);
        }

        /** Represents an OneofMemberMessage1. */
        class OneofMemberMessage1 implements IOneofMemberMessage1 {

            /**
             * Constructs a new OneofMemberMessage1.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.oneof.IOneofMemberMessage1);

            /** OneofMemberMessage1 body. */
            public body: string;

            /**
             * Creates a new OneofMemberMessage1 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofMemberMessage1 instance
             */
            public static create(properties?: testapi.oneof.IOneofMemberMessage1): testapi.oneof.OneofMemberMessage1;

            /**
             * Encodes the specified OneofMemberMessage1 message. Does not implicitly {@link testapi.oneof.OneofMemberMessage1.verify|verify} messages.
             * @param message OneofMemberMessage1 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.oneof.IOneofMemberMessage1, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofMemberMessage1 message, length delimited. Does not implicitly {@link testapi.oneof.OneofMemberMessage1.verify|verify} messages.
             * @param message OneofMemberMessage1 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.oneof.IOneofMemberMessage1, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofMemberMessage1 message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofMemberMessage1
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.oneof.OneofMemberMessage1;

            /**
             * Decodes an OneofMemberMessage1 message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofMemberMessage1
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.oneof.OneofMemberMessage1;

            /**
             * Verifies an OneofMemberMessage1 message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofMemberMessage1 message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofMemberMessage1
             */
            public static fromObject(object: { [k: string]: any }): testapi.oneof.OneofMemberMessage1;

            /**
             * Creates a plain object from an OneofMemberMessage1 message. Also converts values to other types if specified.
             * @param message OneofMemberMessage1
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.oneof.OneofMemberMessage1, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofMemberMessage1 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an OneofMemberMessage2. */
        interface IOneofMemberMessage2 {

            /** OneofMemberMessage2 imageUrl */
            imageUrl?: (string|null);
        }

        /** Represents an OneofMemberMessage2. */
        class OneofMemberMessage2 implements IOneofMemberMessage2 {

            /**
             * Constructs a new OneofMemberMessage2.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.oneof.IOneofMemberMessage2);

            /** OneofMemberMessage2 imageUrl. */
            public imageUrl: string;

            /**
             * Creates a new OneofMemberMessage2 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofMemberMessage2 instance
             */
            public static create(properties?: testapi.oneof.IOneofMemberMessage2): testapi.oneof.OneofMemberMessage2;

            /**
             * Encodes the specified OneofMemberMessage2 message. Does not implicitly {@link testapi.oneof.OneofMemberMessage2.verify|verify} messages.
             * @param message OneofMemberMessage2 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.oneof.IOneofMemberMessage2, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofMemberMessage2 message, length delimited. Does not implicitly {@link testapi.oneof.OneofMemberMessage2.verify|verify} messages.
             * @param message OneofMemberMessage2 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.oneof.IOneofMemberMessage2, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofMemberMessage2 message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofMemberMessage2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.oneof.OneofMemberMessage2;

            /**
             * Decodes an OneofMemberMessage2 message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofMemberMessage2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.oneof.OneofMemberMessage2;

            /**
             * Verifies an OneofMemberMessage2 message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofMemberMessage2 message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofMemberMessage2
             */
            public static fromObject(object: { [k: string]: any }): testapi.oneof.OneofMemberMessage2;

            /**
             * Creates a plain object from an OneofMemberMessage2 message. Also converts values to other types if specified.
             * @param message OneofMemberMessage2
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.oneof.OneofMemberMessage2, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofMemberMessage2 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
