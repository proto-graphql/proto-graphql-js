import * as $protobuf from "protobufjs";
/** Namespace testapis. */
export namespace testapis {

    /** Namespace deprecation. */
    namespace deprecation {

        /** Properties of a FieldBehaviorComentsMessage. */
        interface IFieldBehaviorComentsMessage {

            /** FieldBehaviorComentsMessage requiredField */
            requiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredOutputOnlyField */
            requiredOutputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyRequiredField */
            outputOnlyRequiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyField */
            outputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredInputOnlyField */
            requiredInputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyRequiredField */
            inputOnlyRequiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyField */
            inputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);
        }

        /** Represents a FieldBehaviorComentsMessage. */
        class FieldBehaviorComentsMessage implements IFieldBehaviorComentsMessage {

            /**
             * Constructs a new FieldBehaviorComentsMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapis.deprecation.IFieldBehaviorComentsMessage);

            /** FieldBehaviorComentsMessage requiredField. */
            public requiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredOutputOnlyField. */
            public requiredOutputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyRequiredField. */
            public outputOnlyRequiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyField. */
            public outputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredInputOnlyField. */
            public requiredInputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyRequiredField. */
            public inputOnlyRequiredField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyField. */
            public inputOnlyField?: (testapis.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /**
             * Creates a new FieldBehaviorComentsMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldBehaviorComentsMessage instance
             */
            public static create(properties?: testapis.deprecation.IFieldBehaviorComentsMessage): testapis.deprecation.FieldBehaviorComentsMessage;

            /**
             * Encodes the specified FieldBehaviorComentsMessage message. Does not implicitly {@link testapis.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @param message FieldBehaviorComentsMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapis.deprecation.IFieldBehaviorComentsMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldBehaviorComentsMessage message, length delimited. Does not implicitly {@link testapis.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @param message FieldBehaviorComentsMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapis.deprecation.IFieldBehaviorComentsMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.FieldBehaviorComentsMessage;

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.FieldBehaviorComentsMessage;

            /**
             * Verifies a FieldBehaviorComentsMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldBehaviorComentsMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldBehaviorComentsMessage
             */
            public static fromObject(object: { [k: string]: any }): testapis.deprecation.FieldBehaviorComentsMessage;

            /**
             * Creates a plain object from a FieldBehaviorComentsMessage message. Also converts values to other types if specified.
             * @param message FieldBehaviorComentsMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapis.deprecation.FieldBehaviorComentsMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldBehaviorComentsMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FieldBehaviorComentsMessage {

            /** Properties of a Post. */
            interface IPost {

                /** Post body */
                body?: (string|null);
            }

            /** Represents a Post. */
            class Post implements IPost {

                /**
                 * Constructs a new Post.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: testapis.deprecation.FieldBehaviorComentsMessage.IPost);

                /** Post body. */
                public body: string;

                /**
                 * Creates a new Post instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Post instance
                 */
                public static create(properties?: testapis.deprecation.FieldBehaviorComentsMessage.IPost): testapis.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Encodes the specified Post message. Does not implicitly {@link testapis.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @param message Post message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapis.deprecation.FieldBehaviorComentsMessage.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Post message, length delimited. Does not implicitly {@link testapis.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @param message Post message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapis.deprecation.FieldBehaviorComentsMessage.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Post message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapis.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Decodes a Post message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapis.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Verifies a Post message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Post message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Post
                 */
                public static fromObject(object: { [k: string]: any }): testapis.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Creates a plain object from a Post message. Also converts values to other types if specified.
                 * @param message Post
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapis.deprecation.FieldBehaviorComentsMessage.Post, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Post to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
