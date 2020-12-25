import * as $protobuf from "protobufjs";
/** Namespace testapi. */
export namespace testapi {

    /** Namespace deprecation. */
    namespace deprecation {

        /** Properties of a FieldBehaviorComentsMessage. */
        interface IFieldBehaviorComentsMessage {

            /** FieldBehaviorComentsMessage requiredField */
            requiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredOutputOnlyField */
            requiredOutputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyRequiredField */
            outputOnlyRequiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyField */
            outputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredInputOnlyField */
            requiredInputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyRequiredField */
            inputOnlyRequiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyField */
            inputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);
        }

        /** Represents a FieldBehaviorComentsMessage. */
        class FieldBehaviorComentsMessage implements IFieldBehaviorComentsMessage {

            /**
             * Constructs a new FieldBehaviorComentsMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: testapi.deprecation.IFieldBehaviorComentsMessage);

            /** FieldBehaviorComentsMessage requiredField. */
            public requiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredOutputOnlyField. */
            public requiredOutputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyRequiredField. */
            public outputOnlyRequiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage outputOnlyField. */
            public outputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage requiredInputOnlyField. */
            public requiredInputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyRequiredField. */
            public inputOnlyRequiredField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /** FieldBehaviorComentsMessage inputOnlyField. */
            public inputOnlyField?: (testapi.deprecation.FieldBehaviorComentsMessage.IPost|null);

            /**
             * Creates a new FieldBehaviorComentsMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldBehaviorComentsMessage instance
             */
            public static create(properties?: testapi.deprecation.IFieldBehaviorComentsMessage): testapi.deprecation.FieldBehaviorComentsMessage;

            /**
             * Encodes the specified FieldBehaviorComentsMessage message. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @param message FieldBehaviorComentsMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: testapi.deprecation.IFieldBehaviorComentsMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldBehaviorComentsMessage message, length delimited. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @param message FieldBehaviorComentsMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: testapi.deprecation.IFieldBehaviorComentsMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.deprecation.FieldBehaviorComentsMessage;

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.deprecation.FieldBehaviorComentsMessage;

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
            public static fromObject(object: { [k: string]: any }): testapi.deprecation.FieldBehaviorComentsMessage;

            /**
             * Creates a plain object from a FieldBehaviorComentsMessage message. Also converts values to other types if specified.
             * @param message FieldBehaviorComentsMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: testapi.deprecation.FieldBehaviorComentsMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
                constructor(properties?: testapi.deprecation.FieldBehaviorComentsMessage.IPost);

                /** Post body. */
                public body: string;

                /**
                 * Creates a new Post instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Post instance
                 */
                public static create(properties?: testapi.deprecation.FieldBehaviorComentsMessage.IPost): testapi.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Encodes the specified Post message. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @param message Post message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: testapi.deprecation.FieldBehaviorComentsMessage.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Post message, length delimited. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @param message Post message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: testapi.deprecation.FieldBehaviorComentsMessage.IPost, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Post message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): testapi.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Decodes a Post message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): testapi.deprecation.FieldBehaviorComentsMessage.Post;

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
                public static fromObject(object: { [k: string]: any }): testapi.deprecation.FieldBehaviorComentsMessage.Post;

                /**
                 * Creates a plain object from a Post message. Also converts values to other types if specified.
                 * @param message Post
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: testapi.deprecation.FieldBehaviorComentsMessage.Post, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Post to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
