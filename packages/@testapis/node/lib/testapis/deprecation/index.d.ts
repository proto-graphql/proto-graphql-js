import * as $protobuf from "protobufjs";
/** Namespace testapis. */
export namespace testapis {

    /** Namespace deprecation. */
    namespace deprecation {

        /** Properties of a DeprecatedMessage. */
        interface IDeprecatedMessage {

            /** DeprecatedMessage body */
            body?: (string|null);

            /** DeprecatedMessage enum */
            "enum"?: (testapis.deprecation.NotDeprecatedEnum|null);
        }

        /** Represents a DeprecatedMessage. */
        class DeprecatedMessage implements IDeprecatedMessage {

            /**
             * Constructs a new DeprecatedMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.deprecation.IDeprecatedMessage);

            /** DeprecatedMessage body. */
            public body: string;

            /** DeprecatedMessage enum. */
            public enum: testapis.deprecation.NotDeprecatedEnum;

            /**
             * Creates a new DeprecatedMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeprecatedMessage instance
             */
            public static create(properties?: testapis.deprecation.IDeprecatedMessage): testapis.deprecation.DeprecatedMessage;

            /**
             * Encodes the specified DeprecatedMessage message. Does not implicitly {@link testapis.deprecation.DeprecatedMessage.verify|verify} messages.
             * @param message DeprecatedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.deprecation.IDeprecatedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeprecatedMessage message, length delimited. Does not implicitly {@link testapis.deprecation.DeprecatedMessage.verify|verify} messages.
             * @param message DeprecatedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.deprecation.IDeprecatedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeprecatedMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.DeprecatedMessage;

            /**
             * Decodes a DeprecatedMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.DeprecatedMessage;

            /**
             * Verifies a DeprecatedMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeprecatedMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeprecatedMessage
             */
            public static fromObject(object: { [k: string]: any }): testapis.deprecation.DeprecatedMessage;

            /**
             * Creates a plain object from a DeprecatedMessage message. Also converts values to other types if specified.
             * @param message DeprecatedMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.deprecation.DeprecatedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeprecatedMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace DeprecatedMessage {

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
                constructor(properties?: testapis.deprecation.DeprecatedMessage.IInnerMessage);

                /** InnerMessage body. */
                public body: string;

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InnerMessage instance
                 */
                public static create(properties?: testapis.deprecation.DeprecatedMessage.IInnerMessage): testapis.deprecation.DeprecatedMessage.InnerMessage;

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapis.deprecation.DeprecatedMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapis.deprecation.DeprecatedMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapis.deprecation.DeprecatedMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapis.deprecation.DeprecatedMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.DeprecatedMessage.InnerMessage;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.DeprecatedMessage.InnerMessage;

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
                public static fromObject(object: { [k: string]: any }): testapis.deprecation.DeprecatedMessage.InnerMessage;

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @param message InnerMessage
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapis.deprecation.DeprecatedMessage.InnerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InnerMessage to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a NotDeprecatedMessage. */
        interface INotDeprecatedMessage {

            /** NotDeprecatedMessage body */
            body?: (string|null);

            /** NotDeprecatedMessage enum */
            "enum"?: (testapis.deprecation.DeprecatedEnum|null);

            /** NotDeprecatedMessage msg1 */
            msg1?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage1|null);

            /** NotDeprecatedMessage msg2 */
            msg2?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage2|null);

            /** NotDeprecatedMessage msg3 */
            msg3?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage1|null);

            /** NotDeprecatedMessage msg4 */
            msg4?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage2|null);
        }

        /** Represents a NotDeprecatedMessage. */
        class NotDeprecatedMessage implements INotDeprecatedMessage {

            /**
             * Constructs a new NotDeprecatedMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.deprecation.INotDeprecatedMessage);

            /** NotDeprecatedMessage body. */
            public body: string;

            /** NotDeprecatedMessage enum. */
            public enum: testapis.deprecation.DeprecatedEnum;

            /** NotDeprecatedMessage msg1. */
            public msg1?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage1|null);

            /** NotDeprecatedMessage msg2. */
            public msg2?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage2|null);

            /** NotDeprecatedMessage msg3. */
            public msg3?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage1|null);

            /** NotDeprecatedMessage msg4. */
            public msg4?: (testapis.deprecation.NotDeprecatedMessage.IInnerMessage2|null);

            /** NotDeprecatedMessage notDeprecatedOneof. */
            public notDeprecatedOneof?: ("msg1"|"msg2");

            /** NotDeprecatedMessage deprecatedOneof. */
            public deprecatedOneof?: ("msg3"|"msg4");

            /**
             * Creates a new NotDeprecatedMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NotDeprecatedMessage instance
             */
            public static create(properties?: testapis.deprecation.INotDeprecatedMessage): testapis.deprecation.NotDeprecatedMessage;

            /**
             * Encodes the specified NotDeprecatedMessage message. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.verify|verify} messages.
             * @param message NotDeprecatedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.deprecation.INotDeprecatedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NotDeprecatedMessage message, length delimited. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.verify|verify} messages.
             * @param message NotDeprecatedMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.deprecation.INotDeprecatedMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NotDeprecatedMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NotDeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.NotDeprecatedMessage;

            /**
             * Decodes a NotDeprecatedMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NotDeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.NotDeprecatedMessage;

            /**
             * Verifies a NotDeprecatedMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NotDeprecatedMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NotDeprecatedMessage
             */
            public static fromObject(object: { [k: string]: any }): testapis.deprecation.NotDeprecatedMessage;

            /**
             * Creates a plain object from a NotDeprecatedMessage message. Also converts values to other types if specified.
             * @param message NotDeprecatedMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.deprecation.NotDeprecatedMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NotDeprecatedMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace NotDeprecatedMessage {

            /** Properties of an InnerMessage1. */
            interface IInnerMessage1 {

                /** InnerMessage1 body */
                body?: (string|null);
            }

            /** Represents an InnerMessage1. */
            class InnerMessage1 implements IInnerMessage1 {

                /**
                 * Constructs a new InnerMessage1.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: testapis.deprecation.NotDeprecatedMessage.IInnerMessage1);

                /** InnerMessage1 body. */
                public body: string;

                /**
                 * Creates a new InnerMessage1 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InnerMessage1 instance
                 */
                public static create(properties?: testapis.deprecation.NotDeprecatedMessage.IInnerMessage1): testapis.deprecation.NotDeprecatedMessage.InnerMessage1;

                /**
                 * Encodes the specified InnerMessage1 message. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.InnerMessage1.verify|verify} messages.
                 * @param message InnerMessage1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapis.deprecation.NotDeprecatedMessage.IInnerMessage1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InnerMessage1 message, length delimited. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.InnerMessage1.verify|verify} messages.
                 * @param message InnerMessage1 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapis.deprecation.NotDeprecatedMessage.IInnerMessage1, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InnerMessage1 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InnerMessage1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.NotDeprecatedMessage.InnerMessage1;

                /**
                 * Decodes an InnerMessage1 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InnerMessage1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.NotDeprecatedMessage.InnerMessage1;

                /**
                 * Verifies an InnerMessage1 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InnerMessage1 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InnerMessage1
                 */
                public static fromObject(object: { [k: string]: any }): testapis.deprecation.NotDeprecatedMessage.InnerMessage1;

                /**
                 * Creates a plain object from an InnerMessage1 message. Also converts values to other types if specified.
                 * @param message InnerMessage1
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapis.deprecation.NotDeprecatedMessage.InnerMessage1, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InnerMessage1 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an InnerMessage2. */
            interface IInnerMessage2 {

                /** InnerMessage2 body */
                body?: (string|null);
            }

            /** Represents an InnerMessage2. */
            class InnerMessage2 implements IInnerMessage2 {

                /**
                 * Constructs a new InnerMessage2.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: testapis.deprecation.NotDeprecatedMessage.IInnerMessage2);

                /** InnerMessage2 body. */
                public body: string;

                /**
                 * Creates a new InnerMessage2 instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InnerMessage2 instance
                 */
                public static create(properties?: testapis.deprecation.NotDeprecatedMessage.IInnerMessage2): testapis.deprecation.NotDeprecatedMessage.InnerMessage2;

                /**
                 * Encodes the specified InnerMessage2 message. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.InnerMessage2.verify|verify} messages.
                 * @param message InnerMessage2 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapis.deprecation.NotDeprecatedMessage.IInnerMessage2, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InnerMessage2 message, length delimited. Does not implicitly {@link testapis.deprecation.NotDeprecatedMessage.InnerMessage2.verify|verify} messages.
                 * @param message InnerMessage2 message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapis.deprecation.NotDeprecatedMessage.IInnerMessage2, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InnerMessage2 message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InnerMessage2
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.NotDeprecatedMessage.InnerMessage2;

                /**
                 * Decodes an InnerMessage2 message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InnerMessage2
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.NotDeprecatedMessage.InnerMessage2;

                /**
                 * Verifies an InnerMessage2 message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an InnerMessage2 message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns InnerMessage2
                 */
                public static fromObject(object: { [k: string]: any }): testapis.deprecation.NotDeprecatedMessage.InnerMessage2;

                /**
                 * Creates a plain object from an InnerMessage2 message. Also converts values to other types if specified.
                 * @param message InnerMessage2
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapis.deprecation.NotDeprecatedMessage.InnerMessage2, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InnerMessage2 to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** NotDeprecatedEnum enum. */
        enum NotDeprecatedEnum {
            NOT_DEPRECATED_ENUM_UNSPECIFIED = 0,
            NOT_DEPRECATED_FOO = 1,
            DEPRECATED_BAR = 2
        }

        /** DeprecatedEnum enum. */
        enum DeprecatedEnum {
            DEPRECATED_ENUM_UNSPECIFIED = 0,
            DEPRECATED_BAZ = 1,
            DEPRECATED_QUX = 2
        }

        /** Properties of a DeprecatedFileMessage. */
        interface IDeprecatedFileMessage {

            /** DeprecatedFileMessage body */
            body?: (string|null);

            /** DeprecatedFileMessage enum */
            "enum"?: (testapis.deprecation.DeprecatedFileEnum|null);
        }

        /** Represents a DeprecatedFileMessage. */
        class DeprecatedFileMessage implements IDeprecatedFileMessage {

            /**
             * Constructs a new DeprecatedFileMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.deprecation.IDeprecatedFileMessage);

            /** DeprecatedFileMessage body. */
            public body: string;

            /** DeprecatedFileMessage enum. */
            public enum: testapis.deprecation.DeprecatedFileEnum;

            /**
             * Creates a new DeprecatedFileMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeprecatedFileMessage instance
             */
            public static create(properties?: testapis.deprecation.IDeprecatedFileMessage): testapis.deprecation.DeprecatedFileMessage;

            /**
             * Encodes the specified DeprecatedFileMessage message. Does not implicitly {@link testapis.deprecation.DeprecatedFileMessage.verify|verify} messages.
             * @param message DeprecatedFileMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.deprecation.IDeprecatedFileMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeprecatedFileMessage message, length delimited. Does not implicitly {@link testapis.deprecation.DeprecatedFileMessage.verify|verify} messages.
             * @param message DeprecatedFileMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.deprecation.IDeprecatedFileMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeprecatedFileMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeprecatedFileMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.DeprecatedFileMessage;

            /**
             * Decodes a DeprecatedFileMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeprecatedFileMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.DeprecatedFileMessage;

            /**
             * Verifies a DeprecatedFileMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeprecatedFileMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeprecatedFileMessage
             */
            public static fromObject(object: { [k: string]: any }): testapis.deprecation.DeprecatedFileMessage;

            /**
             * Creates a plain object from a DeprecatedFileMessage message. Also converts values to other types if specified.
             * @param message DeprecatedFileMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.deprecation.DeprecatedFileMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeprecatedFileMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace DeprecatedFileMessage {

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
                constructor(properties?: testapis.deprecation.DeprecatedFileMessage.IInnerMessage);

                /** InnerMessage body. */
                public body: string;

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns InnerMessage instance
                 */
                public static create(properties?: testapis.deprecation.DeprecatedFileMessage.IInnerMessage): testapis.deprecation.DeprecatedFileMessage.InnerMessage;

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapis.deprecation.DeprecatedFileMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapis.deprecation.DeprecatedFileMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapis.deprecation.DeprecatedFileMessage.InnerMessage.verify|verify} messages.
                 * @param message InnerMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapis.deprecation.DeprecatedFileMessage.IInnerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.DeprecatedFileMessage.InnerMessage;

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.DeprecatedFileMessage.InnerMessage;

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
                public static fromObject(object: { [k: string]: any }): testapis.deprecation.DeprecatedFileMessage.InnerMessage;

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @param message InnerMessage
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapis.deprecation.DeprecatedFileMessage.InnerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this InnerMessage to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** DeprecatedFileEnum enum. */
        enum DeprecatedFileEnum {
            DEPRECATED_FILE_ENUM_UNSPECIFIED = 0,
            DEPRECATED_FILE_FOO = 1,
            DEPRECATED_FILE_BAR = 2
        }
    }
}
