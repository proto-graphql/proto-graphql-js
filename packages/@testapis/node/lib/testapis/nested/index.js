/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.testapis = (function() {

    /**
     * Namespace testapis.
     * @exports testapis
     * @namespace
     */
    var testapis = {};

    testapis.nested = (function() {

        /**
         * Namespace nested.
         * @memberof testapis
         * @namespace
         */
        var nested = {};

        nested.ParentMessage = (function() {

            /**
             * Properties of a ParentMessage.
             * @memberof testapis.nested
             * @interface IParentMessage
             * @property {string|null} [body] ParentMessage body
             * @property {testapis.nested.ParentMessage.INestedMessage|null} [nested] ParentMessage nested
             * @property {testapis.nested.ParentMessage.NestedEnum|null} [nestedEnum] ParentMessage nestedEnum
             */

            /**
             * Constructs a new ParentMessage.
             * @memberof testapis.nested
             * @classdesc Represents a ParentMessage.
             * @implements IParentMessage
             * @constructor
             * @param {testapis.nested.IParentMessage=} [properties] Properties to set
             */
            function ParentMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ParentMessage body.
             * @member {string} body
             * @memberof testapis.nested.ParentMessage
             * @instance
             */
            ParentMessage.prototype.body = "";

            /**
             * ParentMessage nested.
             * @member {testapis.nested.ParentMessage.INestedMessage|null|undefined} nested
             * @memberof testapis.nested.ParentMessage
             * @instance
             */
            ParentMessage.prototype.nested = null;

            /**
             * ParentMessage nestedEnum.
             * @member {testapis.nested.ParentMessage.NestedEnum} nestedEnum
             * @memberof testapis.nested.ParentMessage
             * @instance
             */
            ParentMessage.prototype.nestedEnum = 0;

            /**
             * Creates a new ParentMessage instance using the specified properties.
             * @function create
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {testapis.nested.IParentMessage=} [properties] Properties to set
             * @returns {testapis.nested.ParentMessage} ParentMessage instance
             */
            ParentMessage.create = function create(properties) {
                return new ParentMessage(properties);
            };

            /**
             * Encodes the specified ParentMessage message. Does not implicitly {@link testapis.nested.ParentMessage.verify|verify} messages.
             * @function encode
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {testapis.nested.IParentMessage} message ParentMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ParentMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message.nested != null && Object.hasOwnProperty.call(message, "nested"))
                    $root.testapis.nested.ParentMessage.NestedMessage.encode(message.nested, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.nestedEnum != null && Object.hasOwnProperty.call(message, "nestedEnum"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.nestedEnum);
                return writer;
            };

            /**
             * Encodes the specified ParentMessage message, length delimited. Does not implicitly {@link testapis.nested.ParentMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {testapis.nested.IParentMessage} message ParentMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ParentMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ParentMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapis.nested.ParentMessage} ParentMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ParentMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapis.nested.ParentMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = reader.string();
                        break;
                    case 2:
                        message.nested = $root.testapis.nested.ParentMessage.NestedMessage.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.nestedEnum = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ParentMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapis.nested.ParentMessage} ParentMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ParentMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ParentMessage message.
             * @function verify
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ParentMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message.nested != null && message.hasOwnProperty("nested")) {
                    var error = $root.testapis.nested.ParentMessage.NestedMessage.verify(message.nested);
                    if (error)
                        return "nested." + error;
                }
                if (message.nestedEnum != null && message.hasOwnProperty("nestedEnum"))
                    switch (message.nestedEnum) {
                    default:
                        return "nestedEnum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a ParentMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapis.nested.ParentMessage} ParentMessage
             */
            ParentMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapis.nested.ParentMessage)
                    return object;
                var message = new $root.testapis.nested.ParentMessage();
                if (object.body != null)
                    message.body = String(object.body);
                if (object.nested != null) {
                    if (typeof object.nested !== "object")
                        throw TypeError(".testapis.nested.ParentMessage.nested: object expected");
                    message.nested = $root.testapis.nested.ParentMessage.NestedMessage.fromObject(object.nested);
                }
                switch (object.nestedEnum) {
                case "NESTED_ENUM_UNSPECIFIED":
                case 0:
                    message.nestedEnum = 0;
                    break;
                case "FOO":
                case 1:
                    message.nestedEnum = 1;
                    break;
                case "BAR":
                case 2:
                    message.nestedEnum = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a ParentMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapis.nested.ParentMessage
             * @static
             * @param {testapis.nested.ParentMessage} message ParentMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ParentMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.body = "";
                    object.nested = null;
                    object.nestedEnum = options.enums === String ? "NESTED_ENUM_UNSPECIFIED" : 0;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message.nested != null && message.hasOwnProperty("nested"))
                    object.nested = $root.testapis.nested.ParentMessage.NestedMessage.toObject(message.nested, options);
                if (message.nestedEnum != null && message.hasOwnProperty("nestedEnum"))
                    object.nestedEnum = options.enums === String ? $root.testapis.nested.ParentMessage.NestedEnum[message.nestedEnum] : message.nestedEnum;
                return object;
            };

            /**
             * Converts this ParentMessage to JSON.
             * @function toJSON
             * @memberof testapis.nested.ParentMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ParentMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            ParentMessage.NestedMessage = (function() {

                /**
                 * Properties of a NestedMessage.
                 * @memberof testapis.nested.ParentMessage
                 * @interface INestedMessage
                 * @property {string|null} [nestedBody] NestedMessage nestedBody
                 */

                /**
                 * Constructs a new NestedMessage.
                 * @memberof testapis.nested.ParentMessage
                 * @classdesc Represents a NestedMessage.
                 * @implements INestedMessage
                 * @constructor
                 * @param {testapis.nested.ParentMessage.INestedMessage=} [properties] Properties to set
                 */
                function NestedMessage(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * NestedMessage nestedBody.
                 * @member {string} nestedBody
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @instance
                 */
                NestedMessage.prototype.nestedBody = "";

                /**
                 * Creates a new NestedMessage instance using the specified properties.
                 * @function create
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {testapis.nested.ParentMessage.INestedMessage=} [properties] Properties to set
                 * @returns {testapis.nested.ParentMessage.NestedMessage} NestedMessage instance
                 */
                NestedMessage.create = function create(properties) {
                    return new NestedMessage(properties);
                };

                /**
                 * Encodes the specified NestedMessage message. Does not implicitly {@link testapis.nested.ParentMessage.NestedMessage.verify|verify} messages.
                 * @function encode
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {testapis.nested.ParentMessage.INestedMessage} message NestedMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                NestedMessage.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.nestedBody != null && Object.hasOwnProperty.call(message, "nestedBody"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.nestedBody);
                    return writer;
                };

                /**
                 * Encodes the specified NestedMessage message, length delimited. Does not implicitly {@link testapis.nested.ParentMessage.NestedMessage.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {testapis.nested.ParentMessage.INestedMessage} message NestedMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                NestedMessage.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a NestedMessage message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapis.nested.ParentMessage.NestedMessage} NestedMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                NestedMessage.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapis.nested.ParentMessage.NestedMessage();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.nestedBody = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a NestedMessage message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapis.nested.ParentMessage.NestedMessage} NestedMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                NestedMessage.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a NestedMessage message.
                 * @function verify
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                NestedMessage.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.nestedBody != null && message.hasOwnProperty("nestedBody"))
                        if (!$util.isString(message.nestedBody))
                            return "nestedBody: string expected";
                    return null;
                };

                /**
                 * Creates a NestedMessage message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapis.nested.ParentMessage.NestedMessage} NestedMessage
                 */
                NestedMessage.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapis.nested.ParentMessage.NestedMessage)
                        return object;
                    var message = new $root.testapis.nested.ParentMessage.NestedMessage();
                    if (object.nestedBody != null)
                        message.nestedBody = String(object.nestedBody);
                    return message;
                };

                /**
                 * Creates a plain object from a NestedMessage message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @static
                 * @param {testapis.nested.ParentMessage.NestedMessage} message NestedMessage
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                NestedMessage.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.nestedBody = "";
                    if (message.nestedBody != null && message.hasOwnProperty("nestedBody"))
                        object.nestedBody = message.nestedBody;
                    return object;
                };

                /**
                 * Converts this NestedMessage to JSON.
                 * @function toJSON
                 * @memberof testapis.nested.ParentMessage.NestedMessage
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                NestedMessage.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return NestedMessage;
            })();

            /**
             * NestedEnum enum.
             * @name testapis.nested.ParentMessage.NestedEnum
             * @enum {number}
             * @property {number} NESTED_ENUM_UNSPECIFIED=0 NESTED_ENUM_UNSPECIFIED value
             * @property {number} FOO=1 FOO value
             * @property {number} BAR=2 BAR value
             */
            ParentMessage.NestedEnum = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "NESTED_ENUM_UNSPECIFIED"] = 0;
                values[valuesById[1] = "FOO"] = 1;
                values[valuesById[2] = "BAR"] = 2;
                return values;
            })();

            return ParentMessage;
        })();

        return nested;
    })();

    return testapis;
})();

module.exports = $root;
