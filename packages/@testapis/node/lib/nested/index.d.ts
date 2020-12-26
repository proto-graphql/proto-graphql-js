import * as $protobuf from "protobufjs";
/** Namespace testapi. */
export namespace testapi {

    /** Namespace nested. */
    namespace nested {

        /** Properties of a ParentMessage. */
        interface IParentMessage {

            /** ParentMessage body */
            body?: (string|null);

            /** ParentMessage nested */
            nested?: (testapi.nested.ParentMessage.INestedMessage|null);

            /** ParentMessage nestedEnum */
            nestedEnum?: (testapi.nested.ParentMessage.NestedEnum|null);
        }

        /** Represents a ParentMessage. */
        class ParentMessage implements IParentMessage {

            /**
             * Constructs a new ParentMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.nested.IParentMessage);

            /** ParentMessage body. */
            public body: string;

            /** ParentMessage nested. */
            public nested?: (testapi.nested.ParentMessage.INestedMessage|null);

            /** ParentMessage nestedEnum. */
            public nestedEnum: testapi.nested.ParentMessage.NestedEnum;

            /**
             * Creates a new ParentMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ParentMessage instance
             */
            public static create(properties?: testapi.nested.IParentMessage): testapi.nested.ParentMessage;

            /**
             * Encodes the specified ParentMessage message. Does not implicitly {@link testapi.nested.ParentMessage.verify|verify} messages.
             * @param message ParentMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.nested.IParentMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ParentMessage message, length delimited. Does not implicitly {@link testapi.nested.ParentMessage.verify|verify} messages.
             * @param message ParentMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.nested.IParentMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ParentMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ParentMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.nested.ParentMessage;

            /**
             * Decodes a ParentMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ParentMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.nested.ParentMessage;

            /**
             * Verifies a ParentMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ParentMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ParentMessage
             */
            public static fromObject(object: { [k: string]: any }): testapi.nested.ParentMessage;

            /**
             * Creates a plain object from a ParentMessage message. Also converts values to other types if specified.
             * @param message ParentMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.nested.ParentMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ParentMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace ParentMessage {

            /** Properties of a NestedMessage. */
            interface INestedMessage {

                /** NestedMessage nestedBody */
                nestedBody?: (string|null);
            }

            /** Represents a NestedMessage. */
            class NestedMessage implements INestedMessage {

                /**
                 * Constructs a new NestedMessage.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: testapi.nested.ParentMessage.INestedMessage);

                /** NestedMessage nestedBody. */
                public nestedBody: string;

                /**
                 * Creates a new NestedMessage instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns NestedMessage instance
                 */
                public static create(properties?: testapi.nested.ParentMessage.INestedMessage): testapi.nested.ParentMessage.NestedMessage;

                /**
                 * Encodes the specified NestedMessage message. Does not implicitly {@link testapi.nested.ParentMessage.NestedMessage.verify|verify} messages.
                 * @param message NestedMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapi.nested.ParentMessage.INestedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified NestedMessage message, length delimited. Does not implicitly {@link testapi.nested.ParentMessage.NestedMessage.verify|verify} messages.
                 * @param message NestedMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapi.nested.ParentMessage.INestedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a NestedMessage message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns NestedMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.nested.ParentMessage.NestedMessage;

                /**
                 * Decodes a NestedMessage message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns NestedMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.nested.ParentMessage.NestedMessage;

                /**
                 * Verifies a NestedMessage message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a NestedMessage message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns NestedMessage
                 */
                public static fromObject(object: { [k: string]: any }): testapi.nested.ParentMessage.NestedMessage;

                /**
                 * Creates a plain object from a NestedMessage message. Also converts values to other types if specified.
                 * @param message NestedMessage
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapi.nested.ParentMessage.NestedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this NestedMessage to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** NestedEnum enum. */
            enum NestedEnum {
                NESTED_ENUM_UNSPECIFIED = 0,
                FOO = 1,
                BAR = 2
            }
        }
    }
}
