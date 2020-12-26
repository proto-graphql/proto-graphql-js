import * as $protobuf from "protobufjs";
/** Namespace testapi. */
export namespace testapi {

    /** Namespace extensions. */
    namespace extensions {

        /** Properties of a PrefixedMessage. */
        interface IPrefixedMessage {

            /** PrefixedMessage body */
            body?: (string|null);

            /** PrefixedMessage prefixedEnum */
            prefixedEnum?: (testapi.extensions.PrefixedEnum|null);

            /** PrefixedMessage ignoredField */
            ignoredField?: (testapi.extensions.PrefixedMessage.IInnerMessage|null);
        }

        /** Represents a PrefixedMessage. */
        class PrefixedMessage implements IPrefixedMessage {

            /**
             * Constructs a new PrefixedMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.extensions.IPrefixedMessage);

            /** PrefixedMessage body. */
            public body: string;

            /** PrefixedMessage prefixedEnum. */
            public prefixedEnum: testapi.extensions.PrefixedEnum;

            /** PrefixedMessage ignoredField. */
            public ignoredField?: (testapi.extensions.PrefixedMessage.IInnerMessage|null);

            /**
             * Creates a new PrefixedMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PrefixedMessage instance
             */
            public static create(properties?: testapi.extensions.IPrefixedMessage): testapi.extensions.PrefixedMessage;

            /**
             * Encodes the specified PrefixedMessage message. Does not implicitly {@link testapi.extensions.PrefixedMessage.verify|verify} messages.
             * @param message PrefixedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.extensions.IPrefixedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PrefixedMessage message, length delimited. Does not implicitly {@link testapi.extensions.PrefixedMessage.verify|verify} messages.
             * @param message PrefixedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.extensions.IPrefixedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PrefixedMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PrefixedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.extensions.PrefixedMessage;

            /**
             * Decodes a PrefixedMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PrefixedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.extensions.PrefixedMessage;

            /**
             * Verifies a PrefixedMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PrefixedMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PrefixedMessage
             */
            public static fromObject(object: { [k: string]: any }): testapi.extensions.PrefixedMessage;

            /**
             * Creates a plain object from a PrefixedMessage message. Also converts values to other types if specified.
             * @param message PrefixedMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.extensions.PrefixedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PrefixedMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace PrefixedMessage {

            /** Properties of an InnerMessage. */
            interface IInnerMessage {

                /** InnerMessage body */
                body?: (string|null);
            }

            /** Represents an InnerMessage. */
            class InnerMessage implements IInnerMessage {

                /**
                 * Constructs a new InnerMessage.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: testapi.extensions.PrefixedMessage.IInnerMessage);

                /** InnerMessage body. */
                public body: string;

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InnerMessage instance
                 */
                public static create(properties?: testapi.extensions.PrefixedMessage.IInnerMessage): testapi.extensions.PrefixedMessage.InnerMessage;

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapi.extensions.PrefixedMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapi.extensions.PrefixedMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapi.extensions.PrefixedMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapi.extensions.PrefixedMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.extensions.PrefixedMessage.InnerMessage;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.extensions.PrefixedMessage.InnerMessage;

                /**
                 * Verifies an InnerMessage message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InnerMessage message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InnerMessage
                 */
                public static fromObject(object: { [k: string]: any }): testapi.extensions.PrefixedMessage.InnerMessage;

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @param message InnerMessage
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapi.extensions.PrefixedMessage.InnerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InnerMessage to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** PrefixedEnum enum. */
        enum PrefixedEnum {
            PREFIXED_ENUM_UNSPECIFIED = 0,
            PREFIXED_FOO = 1,
            PREFIXED_BAR = 2
        }
    }
}
