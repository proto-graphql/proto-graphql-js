/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.testapi = (function() {

    /**
     * Namespace testapi.
     * @exports testapi
     * @namespace
     */
    var testapi = {};

    testapi.deprecation = (function() {

        /**
         * Namespace deprecation.
         * @memberof testapi
         * @namespace
         */
        var deprecation = {};

        deprecation.DeprecatedMessage = (function() {

            /**
             * Properties of a DeprecatedMessage.
             * @memberof testapi.deprecation
             * @interface IDeprecatedMessage
             * @property {string|null} [body] DeprecatedMessage body
             * @property {testapi.deprecation.NotDeprecatedEnum|null} ["enum"] DeprecatedMessage enum
             */

            /**
             * Constructs a new DeprecatedMessage.
             * @memberof testapi.deprecation
             * @classdesc Represents a DeprecatedMessage.
             * @implements IDeprecatedMessage
             * @constructor
             * @param {testapi.deprecation.IDeprecatedMessage=} [properties] Properties to set
             */
            function DeprecatedMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeprecatedMessage body.
             * @member {string} body
             * @memberof testapi.deprecation.DeprecatedMessage
             * @instance
             */
            DeprecatedMessage.prototype.body = "";

            /**
             * DeprecatedMessage enum.
             * @member {testapi.deprecation.NotDeprecatedEnum} enum
             * @memberof testapi.deprecation.DeprecatedMessage
             * @instance
             */
            DeprecatedMessage.prototype["enum"] = 0;

            /**
             * Creates a new DeprecatedMessage instance using the specified properties.
             * @function create
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedMessage=} [properties] Properties to set
             * @returns {testapi.deprecation.DeprecatedMessage} DeprecatedMessage instance
             */
            DeprecatedMessage.create = function create(properties) {
                return new DeprecatedMessage(properties);
            };

            /**
             * Encodes the specified DeprecatedMessage message. Does not implicitly {@link testapi.deprecation.DeprecatedMessage.verify|verify} messages.
             * @function encode
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedMessage} message DeprecatedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeprecatedMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message["enum"] != null && Object.hasOwnProperty.call(message, "enum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message["enum"]);
                return writer;
            };

            /**
             * Encodes the specified DeprecatedMessage message, length delimited. Does not implicitly {@link testapi.deprecation.DeprecatedMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedMessage} message DeprecatedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeprecatedMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeprecatedMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.deprecation.DeprecatedMessage} DeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeprecatedMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.DeprecatedMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = reader.string();
                        break;
                    case 2:
                        message["enum"] = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeprecatedMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.deprecation.DeprecatedMessage} DeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeprecatedMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeprecatedMessage message.
             * @function verify
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeprecatedMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    switch (message["enum"]) {
                    default:
                        return "enum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a DeprecatedMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.deprecation.DeprecatedMessage} DeprecatedMessage
             */
            DeprecatedMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.deprecation.DeprecatedMessage)
                    return object;
                var message = new $root.testapi.deprecation.DeprecatedMessage();
                if (object.body != null)
                    message.body = String(object.body);
                switch (object["enum"]) {
                case "NOT_DEPRECATED_ENUM_UNSPECIFIED":
                case 0:
                    message["enum"] = 0;
                    break;
                case "NOT_DEPRECATED_FOO":
                case 1:
                    message["enum"] = 1;
                    break;
                case "DEPRECATED_BAR":
                case 2:
                    message["enum"] = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a DeprecatedMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.deprecation.DeprecatedMessage
             * @static
             * @param {testapi.deprecation.DeprecatedMessage} message DeprecatedMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeprecatedMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.body = "";
                    object["enum"] = options.enums === String ? "NOT_DEPRECATED_ENUM_UNSPECIFIED" : 0;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    object["enum"] = options.enums === String ? $root.testapi.deprecation.NotDeprecatedEnum[message["enum"]] : message["enum"];
                return object;
            };

            /**
             * Converts this DeprecatedMessage to JSON.
             * @function toJSON
             * @memberof testapi.deprecation.DeprecatedMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeprecatedMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            DeprecatedMessage.InnerMessage = (function() {

                /**
                 * Properties of an InnerMessage.
                 * @memberof testapi.deprecation.DeprecatedMessage
                 * @interface IInnerMessage
                 * @property {string|null} [body] InnerMessage body
                 */

                /**
                 * Constructs a new InnerMessage.
                 * @memberof testapi.deprecation.DeprecatedMessage
                 * @classdesc Represents an InnerMessage.
                 * @implements IInnerMessage
                 * @constructor
                 * @param {testapi.deprecation.DeprecatedMessage.IInnerMessage=} [properties] Properties to set
                 */
                function InnerMessage(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InnerMessage body.
                 * @member {string} body
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @instance
                 */
                InnerMessage.prototype.body = "";

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @function create
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedMessage.IInnerMessage=} [properties] Properties to set
                 * @returns {testapi.deprecation.DeprecatedMessage.InnerMessage} InnerMessage instance
                 */
                InnerMessage.create = function create(properties) {
                    return new InnerMessage(properties);
                };

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapi.deprecation.DeprecatedMessage.InnerMessage.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedMessage.IInnerMessage} message InnerMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                    return writer;
                };

                /**
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapi.deprecation.DeprecatedMessage.InnerMessage.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedMessage.IInnerMessage} message InnerMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.deprecation.DeprecatedMessage.InnerMessage} InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.DeprecatedMessage.InnerMessage();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.body = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.deprecation.DeprecatedMessage.InnerMessage} InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InnerMessage message.
                 * @function verify
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InnerMessage.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.body != null && message.hasOwnProperty("body"))
                        if (!$util.isString(message.body))
                            return "body: string expected";
                    return null;
                };

                /**
                 * Creates an InnerMessage message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.deprecation.DeprecatedMessage.InnerMessage} InnerMessage
                 */
                InnerMessage.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.deprecation.DeprecatedMessage.InnerMessage)
                        return object;
                    var message = new $root.testapi.deprecation.DeprecatedMessage.InnerMessage();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedMessage.InnerMessage} message InnerMessage
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InnerMessage.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.body = "";
                    if (message.body != null && message.hasOwnProperty("body"))
                        object.body = message.body;
                    return object;
                };

                /**
                 * Converts this InnerMessage to JSON.
                 * @function toJSON
                 * @memberof testapi.deprecation.DeprecatedMessage.InnerMessage
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InnerMessage.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InnerMessage;
            })();

            return DeprecatedMessage;
        })();

        deprecation.NotDeprecatedMessage = (function() {

            /**
             * Properties of a NotDeprecatedMessage.
             * @memberof testapi.deprecation
             * @interface INotDeprecatedMessage
             * @property {string|null} [body] NotDeprecatedMessage body
             * @property {testapi.deprecation.DeprecatedEnum|null} ["enum"] NotDeprecatedMessage enum
             * @property {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1|null} [msg1] NotDeprecatedMessage msg1
             * @property {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2|null} [msg2] NotDeprecatedMessage msg2
             * @property {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1|null} [msg3] NotDeprecatedMessage msg3
             * @property {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2|null} [msg4] NotDeprecatedMessage msg4
             */

            /**
             * Constructs a new NotDeprecatedMessage.
             * @memberof testapi.deprecation
             * @classdesc Represents a NotDeprecatedMessage.
             * @implements INotDeprecatedMessage
             * @constructor
             * @param {testapi.deprecation.INotDeprecatedMessage=} [properties] Properties to set
             */
            function NotDeprecatedMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * NotDeprecatedMessage body.
             * @member {string} body
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype.body = "";

            /**
             * NotDeprecatedMessage enum.
             * @member {testapi.deprecation.DeprecatedEnum} enum
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype["enum"] = 0;

            /**
             * NotDeprecatedMessage msg1.
             * @member {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1|null|undefined} msg1
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype.msg1 = null;

            /**
             * NotDeprecatedMessage msg2.
             * @member {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2|null|undefined} msg2
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype.msg2 = null;

            /**
             * NotDeprecatedMessage msg3.
             * @member {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1|null|undefined} msg3
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype.msg3 = null;

            /**
             * NotDeprecatedMessage msg4.
             * @member {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2|null|undefined} msg4
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            NotDeprecatedMessage.prototype.msg4 = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * NotDeprecatedMessage notDeprecatedOneof.
             * @member {"msg1"|"msg2"|undefined} notDeprecatedOneof
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            Object.defineProperty(NotDeprecatedMessage.prototype, "notDeprecatedOneof", {
                get: $util.oneOfGetter($oneOfFields = ["msg1", "msg2"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * NotDeprecatedMessage deprecatedOneof.
             * @member {"msg3"|"msg4"|undefined} deprecatedOneof
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             */
            Object.defineProperty(NotDeprecatedMessage.prototype, "deprecatedOneof", {
                get: $util.oneOfGetter($oneOfFields = ["msg3", "msg4"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new NotDeprecatedMessage instance using the specified properties.
             * @function create
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {testapi.deprecation.INotDeprecatedMessage=} [properties] Properties to set
             * @returns {testapi.deprecation.NotDeprecatedMessage} NotDeprecatedMessage instance
             */
            NotDeprecatedMessage.create = function create(properties) {
                return new NotDeprecatedMessage(properties);
            };

            /**
             * Encodes the specified NotDeprecatedMessage message. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.verify|verify} messages.
             * @function encode
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {testapi.deprecation.INotDeprecatedMessage} message NotDeprecatedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NotDeprecatedMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message["enum"] != null && Object.hasOwnProperty.call(message, "enum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message["enum"]);
                if (message.msg1 != null && Object.hasOwnProperty.call(message, "msg1"))
                    $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.encode(message.msg1, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.msg2 != null && Object.hasOwnProperty.call(message, "msg2"))
                    $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.encode(message.msg2, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.msg3 != null && Object.hasOwnProperty.call(message, "msg3"))
                    $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.encode(message.msg3, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.msg4 != null && Object.hasOwnProperty.call(message, "msg4"))
                    $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.encode(message.msg4, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified NotDeprecatedMessage message, length delimited. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {testapi.deprecation.INotDeprecatedMessage} message NotDeprecatedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            NotDeprecatedMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a NotDeprecatedMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.deprecation.NotDeprecatedMessage} NotDeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NotDeprecatedMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.NotDeprecatedMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = reader.string();
                        break;
                    case 2:
                        message["enum"] = reader.int32();
                        break;
                    case 3:
                        message.msg1 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.msg2 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.decode(reader, reader.uint32());
                        break;
                    case 5:
                        message.msg3 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.decode(reader, reader.uint32());
                        break;
                    case 6:
                        message.msg4 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a NotDeprecatedMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.deprecation.NotDeprecatedMessage} NotDeprecatedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            NotDeprecatedMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a NotDeprecatedMessage message.
             * @function verify
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            NotDeprecatedMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    switch (message["enum"]) {
                    default:
                        return "enum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.msg1 != null && message.hasOwnProperty("msg1")) {
                    properties.notDeprecatedOneof = 1;
                    {
                        var error = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.verify(message.msg1);
                        if (error)
                            return "msg1." + error;
                    }
                }
                if (message.msg2 != null && message.hasOwnProperty("msg2")) {
                    if (properties.notDeprecatedOneof === 1)
                        return "notDeprecatedOneof: multiple values";
                    properties.notDeprecatedOneof = 1;
                    {
                        var error = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.verify(message.msg2);
                        if (error)
                            return "msg2." + error;
                    }
                }
                if (message.msg3 != null && message.hasOwnProperty("msg3")) {
                    properties.deprecatedOneof = 1;
                    {
                        var error = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.verify(message.msg3);
                        if (error)
                            return "msg3." + error;
                    }
                }
                if (message.msg4 != null && message.hasOwnProperty("msg4")) {
                    if (properties.deprecatedOneof === 1)
                        return "deprecatedOneof: multiple values";
                    properties.deprecatedOneof = 1;
                    {
                        var error = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.verify(message.msg4);
                        if (error)
                            return "msg4." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a NotDeprecatedMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.deprecation.NotDeprecatedMessage} NotDeprecatedMessage
             */
            NotDeprecatedMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.deprecation.NotDeprecatedMessage)
                    return object;
                var message = new $root.testapi.deprecation.NotDeprecatedMessage();
                if (object.body != null)
                    message.body = String(object.body);
                switch (object["enum"]) {
                case "DEPRECATED_ENUM_UNSPECIFIED":
                case 0:
                    message["enum"] = 0;
                    break;
                case "DEPRECATED_BAZ":
                case 1:
                    message["enum"] = 1;
                    break;
                case "DEPRECATED_QUX":
                case 2:
                    message["enum"] = 2;
                    break;
                }
                if (object.msg1 != null) {
                    if (typeof object.msg1 !== "object")
                        throw TypeError(".testapi.deprecation.NotDeprecatedMessage.msg1: object expected");
                    message.msg1 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.fromObject(object.msg1);
                }
                if (object.msg2 != null) {
                    if (typeof object.msg2 !== "object")
                        throw TypeError(".testapi.deprecation.NotDeprecatedMessage.msg2: object expected");
                    message.msg2 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.fromObject(object.msg2);
                }
                if (object.msg3 != null) {
                    if (typeof object.msg3 !== "object")
                        throw TypeError(".testapi.deprecation.NotDeprecatedMessage.msg3: object expected");
                    message.msg3 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.fromObject(object.msg3);
                }
                if (object.msg4 != null) {
                    if (typeof object.msg4 !== "object")
                        throw TypeError(".testapi.deprecation.NotDeprecatedMessage.msg4: object expected");
                    message.msg4 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.fromObject(object.msg4);
                }
                return message;
            };

            /**
             * Creates a plain object from a NotDeprecatedMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @static
             * @param {testapi.deprecation.NotDeprecatedMessage} message NotDeprecatedMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            NotDeprecatedMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.body = "";
                    object["enum"] = options.enums === String ? "DEPRECATED_ENUM_UNSPECIFIED" : 0;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    object["enum"] = options.enums === String ? $root.testapi.deprecation.DeprecatedEnum[message["enum"]] : message["enum"];
                if (message.msg1 != null && message.hasOwnProperty("msg1")) {
                    object.msg1 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.toObject(message.msg1, options);
                    if (options.oneofs)
                        object.notDeprecatedOneof = "msg1";
                }
                if (message.msg2 != null && message.hasOwnProperty("msg2")) {
                    object.msg2 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.toObject(message.msg2, options);
                    if (options.oneofs)
                        object.notDeprecatedOneof = "msg2";
                }
                if (message.msg3 != null && message.hasOwnProperty("msg3")) {
                    object.msg3 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1.toObject(message.msg3, options);
                    if (options.oneofs)
                        object.deprecatedOneof = "msg3";
                }
                if (message.msg4 != null && message.hasOwnProperty("msg4")) {
                    object.msg4 = $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2.toObject(message.msg4, options);
                    if (options.oneofs)
                        object.deprecatedOneof = "msg4";
                }
                return object;
            };

            /**
             * Converts this NotDeprecatedMessage to JSON.
             * @function toJSON
             * @memberof testapi.deprecation.NotDeprecatedMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            NotDeprecatedMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            NotDeprecatedMessage.InnerMessage1 = (function() {

                /**
                 * Properties of an InnerMessage1.
                 * @memberof testapi.deprecation.NotDeprecatedMessage
                 * @interface IInnerMessage1
                 * @property {string|null} [body] InnerMessage1 body
                 */

                /**
                 * Constructs a new InnerMessage1.
                 * @memberof testapi.deprecation.NotDeprecatedMessage
                 * @classdesc Represents an InnerMessage1.
                 * @implements IInnerMessage1
                 * @constructor
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1=} [properties] Properties to set
                 */
                function InnerMessage1(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InnerMessage1 body.
                 * @member {string} body
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @instance
                 */
                InnerMessage1.prototype.body = "";

                /**
                 * Creates a new InnerMessage1 instance using the specified properties.
                 * @function create
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1=} [properties] Properties to set
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage1} InnerMessage1 instance
                 */
                InnerMessage1.create = function create(properties) {
                    return new InnerMessage1(properties);
                };

                /**
                 * Encodes the specified InnerMessage1 message. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.InnerMessage1.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1} message InnerMessage1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage1.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                    return writer;
                };

                /**
                 * Encodes the specified InnerMessage1 message, length delimited. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.InnerMessage1.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage1} message InnerMessage1 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage1.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InnerMessage1 message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage1} InnerMessage1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage1.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.body = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InnerMessage1 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage1} InnerMessage1
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage1.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InnerMessage1 message.
                 * @function verify
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InnerMessage1.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.body != null && message.hasOwnProperty("body"))
                        if (!$util.isString(message.body))
                            return "body: string expected";
                    return null;
                };

                /**
                 * Creates an InnerMessage1 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage1} InnerMessage1
                 */
                InnerMessage1.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1)
                        return object;
                    var message = new $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage1();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from an InnerMessage1 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.InnerMessage1} message InnerMessage1
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InnerMessage1.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.body = "";
                    if (message.body != null && message.hasOwnProperty("body"))
                        object.body = message.body;
                    return object;
                };

                /**
                 * Converts this InnerMessage1 to JSON.
                 * @function toJSON
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage1
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InnerMessage1.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InnerMessage1;
            })();

            NotDeprecatedMessage.InnerMessage2 = (function() {

                /**
                 * Properties of an InnerMessage2.
                 * @memberof testapi.deprecation.NotDeprecatedMessage
                 * @interface IInnerMessage2
                 * @property {string|null} [body] InnerMessage2 body
                 */

                /**
                 * Constructs a new InnerMessage2.
                 * @memberof testapi.deprecation.NotDeprecatedMessage
                 * @classdesc Represents an InnerMessage2.
                 * @implements IInnerMessage2
                 * @constructor
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2=} [properties] Properties to set
                 */
                function InnerMessage2(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InnerMessage2 body.
                 * @member {string} body
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @instance
                 */
                InnerMessage2.prototype.body = "";

                /**
                 * Creates a new InnerMessage2 instance using the specified properties.
                 * @function create
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2=} [properties] Properties to set
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage2} InnerMessage2 instance
                 */
                InnerMessage2.create = function create(properties) {
                    return new InnerMessage2(properties);
                };

                /**
                 * Encodes the specified InnerMessage2 message. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.InnerMessage2.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2} message InnerMessage2 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage2.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                    return writer;
                };

                /**
                 * Encodes the specified InnerMessage2 message, length delimited. Does not implicitly {@link testapi.deprecation.NotDeprecatedMessage.InnerMessage2.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.IInnerMessage2} message InnerMessage2 message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage2.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InnerMessage2 message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage2} InnerMessage2
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage2.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.body = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InnerMessage2 message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage2} InnerMessage2
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage2.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InnerMessage2 message.
                 * @function verify
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InnerMessage2.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.body != null && message.hasOwnProperty("body"))
                        if (!$util.isString(message.body))
                            return "body: string expected";
                    return null;
                };

                /**
                 * Creates an InnerMessage2 message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.deprecation.NotDeprecatedMessage.InnerMessage2} InnerMessage2
                 */
                InnerMessage2.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2)
                        return object;
                    var message = new $root.testapi.deprecation.NotDeprecatedMessage.InnerMessage2();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from an InnerMessage2 message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @static
                 * @param {testapi.deprecation.NotDeprecatedMessage.InnerMessage2} message InnerMessage2
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InnerMessage2.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.body = "";
                    if (message.body != null && message.hasOwnProperty("body"))
                        object.body = message.body;
                    return object;
                };

                /**
                 * Converts this InnerMessage2 to JSON.
                 * @function toJSON
                 * @memberof testapi.deprecation.NotDeprecatedMessage.InnerMessage2
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InnerMessage2.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InnerMessage2;
            })();

            return NotDeprecatedMessage;
        })();

        /**
         * NotDeprecatedEnum enum.
         * @name testapi.deprecation.NotDeprecatedEnum
         * @enum {number}
         * @property {number} NOT_DEPRECATED_ENUM_UNSPECIFIED=0 NOT_DEPRECATED_ENUM_UNSPECIFIED value
         * @property {number} NOT_DEPRECATED_FOO=1 NOT_DEPRECATED_FOO value
         * @property {number} DEPRECATED_BAR=2 DEPRECATED_BAR value
         */
        deprecation.NotDeprecatedEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NOT_DEPRECATED_ENUM_UNSPECIFIED"] = 0;
            values[valuesById[1] = "NOT_DEPRECATED_FOO"] = 1;
            values[valuesById[2] = "DEPRECATED_BAR"] = 2;
            return values;
        })();

        /**
         * DeprecatedEnum enum.
         * @name testapi.deprecation.DeprecatedEnum
         * @enum {number}
         * @property {number} DEPRECATED_ENUM_UNSPECIFIED=0 DEPRECATED_ENUM_UNSPECIFIED value
         * @property {number} DEPRECATED_BAZ=1 DEPRECATED_BAZ value
         * @property {number} DEPRECATED_QUX=2 DEPRECATED_QUX value
         */
        deprecation.DeprecatedEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "DEPRECATED_ENUM_UNSPECIFIED"] = 0;
            values[valuesById[1] = "DEPRECATED_BAZ"] = 1;
            values[valuesById[2] = "DEPRECATED_QUX"] = 2;
            return values;
        })();

        deprecation.DeprecatedFileMessage = (function() {

            /**
             * Properties of a DeprecatedFileMessage.
             * @memberof testapi.deprecation
             * @interface IDeprecatedFileMessage
             * @property {string|null} [body] DeprecatedFileMessage body
             * @property {testapi.deprecation.DeprecatedFileEnum|null} ["enum"] DeprecatedFileMessage enum
             */

            /**
             * Constructs a new DeprecatedFileMessage.
             * @memberof testapi.deprecation
             * @classdesc Represents a DeprecatedFileMessage.
             * @implements IDeprecatedFileMessage
             * @constructor
             * @param {testapi.deprecation.IDeprecatedFileMessage=} [properties] Properties to set
             */
            function DeprecatedFileMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeprecatedFileMessage body.
             * @member {string} body
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @instance
             */
            DeprecatedFileMessage.prototype.body = "";

            /**
             * DeprecatedFileMessage enum.
             * @member {testapi.deprecation.DeprecatedFileEnum} enum
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @instance
             */
            DeprecatedFileMessage.prototype["enum"] = 0;

            /**
             * Creates a new DeprecatedFileMessage instance using the specified properties.
             * @function create
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedFileMessage=} [properties] Properties to set
             * @returns {testapi.deprecation.DeprecatedFileMessage} DeprecatedFileMessage instance
             */
            DeprecatedFileMessage.create = function create(properties) {
                return new DeprecatedFileMessage(properties);
            };

            /**
             * Encodes the specified DeprecatedFileMessage message. Does not implicitly {@link testapi.deprecation.DeprecatedFileMessage.verify|verify} messages.
             * @function encode
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedFileMessage} message DeprecatedFileMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeprecatedFileMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message["enum"] != null && Object.hasOwnProperty.call(message, "enum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message["enum"]);
                return writer;
            };

            /**
             * Encodes the specified DeprecatedFileMessage message, length delimited. Does not implicitly {@link testapi.deprecation.DeprecatedFileMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {testapi.deprecation.IDeprecatedFileMessage} message DeprecatedFileMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeprecatedFileMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeprecatedFileMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.deprecation.DeprecatedFileMessage} DeprecatedFileMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeprecatedFileMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.DeprecatedFileMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = reader.string();
                        break;
                    case 2:
                        message["enum"] = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeprecatedFileMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.deprecation.DeprecatedFileMessage} DeprecatedFileMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeprecatedFileMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeprecatedFileMessage message.
             * @function verify
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeprecatedFileMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    switch (message["enum"]) {
                    default:
                        return "enum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a DeprecatedFileMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.deprecation.DeprecatedFileMessage} DeprecatedFileMessage
             */
            DeprecatedFileMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.deprecation.DeprecatedFileMessage)
                    return object;
                var message = new $root.testapi.deprecation.DeprecatedFileMessage();
                if (object.body != null)
                    message.body = String(object.body);
                switch (object["enum"]) {
                case "DEPRECATED_FILE_ENUM_UNSPECIFIED":
                case 0:
                    message["enum"] = 0;
                    break;
                case "DEPRECATED_FILE_FOO":
                case 1:
                    message["enum"] = 1;
                    break;
                case "DEPRECATED_FILE_BAR":
                case 2:
                    message["enum"] = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a DeprecatedFileMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @static
             * @param {testapi.deprecation.DeprecatedFileMessage} message DeprecatedFileMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeprecatedFileMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.body = "";
                    object["enum"] = options.enums === String ? "DEPRECATED_FILE_ENUM_UNSPECIFIED" : 0;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message["enum"] != null && message.hasOwnProperty("enum"))
                    object["enum"] = options.enums === String ? $root.testapi.deprecation.DeprecatedFileEnum[message["enum"]] : message["enum"];
                return object;
            };

            /**
             * Converts this DeprecatedFileMessage to JSON.
             * @function toJSON
             * @memberof testapi.deprecation.DeprecatedFileMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeprecatedFileMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            DeprecatedFileMessage.InnerMessage = (function() {

                /**
                 * Properties of an InnerMessage.
                 * @memberof testapi.deprecation.DeprecatedFileMessage
                 * @interface IInnerMessage
                 * @property {string|null} [body] InnerMessage body
                 */

                /**
                 * Constructs a new InnerMessage.
                 * @memberof testapi.deprecation.DeprecatedFileMessage
                 * @classdesc Represents an InnerMessage.
                 * @implements IInnerMessage
                 * @constructor
                 * @param {testapi.deprecation.DeprecatedFileMessage.IInnerMessage=} [properties] Properties to set
                 */
                function InnerMessage(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * InnerMessage body.
                 * @member {string} body
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @instance
                 */
                InnerMessage.prototype.body = "";

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @function create
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedFileMessage.IInnerMessage=} [properties] Properties to set
                 * @returns {testapi.deprecation.DeprecatedFileMessage.InnerMessage} InnerMessage instance
                 */
                InnerMessage.create = function create(properties) {
                    return new InnerMessage(properties);
                };

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapi.deprecation.DeprecatedFileMessage.InnerMessage.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedFileMessage.IInnerMessage} message InnerMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                    return writer;
                };

                /**
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapi.deprecation.DeprecatedFileMessage.InnerMessage.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedFileMessage.IInnerMessage} message InnerMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.deprecation.DeprecatedFileMessage.InnerMessage} InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.DeprecatedFileMessage.InnerMessage();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.body = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.deprecation.DeprecatedFileMessage.InnerMessage} InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an InnerMessage message.
                 * @function verify
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                InnerMessage.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.body != null && message.hasOwnProperty("body"))
                        if (!$util.isString(message.body))
                            return "body: string expected";
                    return null;
                };

                /**
                 * Creates an InnerMessage message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.deprecation.DeprecatedFileMessage.InnerMessage} InnerMessage
                 */
                InnerMessage.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.deprecation.DeprecatedFileMessage.InnerMessage)
                        return object;
                    var message = new $root.testapi.deprecation.DeprecatedFileMessage.InnerMessage();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @static
                 * @param {testapi.deprecation.DeprecatedFileMessage.InnerMessage} message InnerMessage
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                InnerMessage.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.body = "";
                    if (message.body != null && message.hasOwnProperty("body"))
                        object.body = message.body;
                    return object;
                };

                /**
                 * Converts this InnerMessage to JSON.
                 * @function toJSON
                 * @memberof testapi.deprecation.DeprecatedFileMessage.InnerMessage
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InnerMessage.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InnerMessage;
            })();

            return DeprecatedFileMessage;
        })();

        /**
         * DeprecatedFileEnum enum.
         * @name testapi.deprecation.DeprecatedFileEnum
         * @enum {number}
         * @property {number} DEPRECATED_FILE_ENUM_UNSPECIFIED=0 DEPRECATED_FILE_ENUM_UNSPECIFIED value
         * @property {number} DEPRECATED_FILE_FOO=1 DEPRECATED_FILE_FOO value
         * @property {number} DEPRECATED_FILE_BAR=2 DEPRECATED_FILE_BAR value
         */
        deprecation.DeprecatedFileEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "DEPRECATED_FILE_ENUM_UNSPECIFIED"] = 0;
            values[valuesById[1] = "DEPRECATED_FILE_FOO"] = 1;
            values[valuesById[2] = "DEPRECATED_FILE_BAR"] = 2;
            return values;
        })();

        return deprecation;
    })();

    return testapi;
})();

module.exports = $root;
