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

    testapi.extensions = (function() {

        /**
         * Namespace extensions.
         * @memberof testapi
         * @namespace
         */
        var extensions = {};

        extensions.PrefixedMessage = (function() {

            /**
             * Properties of a PrefixedMessage.
             * @memberof testapi.extensions
             * @interface IPrefixedMessage
             * @property {string|null} [body] PrefixedMessage body
             * @property {testapi.extensions.PrefixedEnum|null} [prefixedEnum] PrefixedMessage prefixedEnum
             * @property {testapi.extensions.PrefixedMessage.IInnerMessage|null} [ignoredField] PrefixedMessage ignoredField
             */

            /**
             * Constructs a new PrefixedMessage.
             * @memberof testapi.extensions
             * @classdesc Represents a PrefixedMessage.
             * @implements IPrefixedMessage
             * @constructor
             * @param {testapi.extensions.IPrefixedMessage=} [properties] Properties to set
             */
            function PrefixedMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PrefixedMessage body.
             * @member {string} body
             * @memberof testapi.extensions.PrefixedMessage
             * @instance
             */
            PrefixedMessage.prototype.body = "";

            /**
             * PrefixedMessage prefixedEnum.
             * @member {testapi.extensions.PrefixedEnum} prefixedEnum
             * @memberof testapi.extensions.PrefixedMessage
             * @instance
             */
            PrefixedMessage.prototype.prefixedEnum = 0;

            /**
             * PrefixedMessage ignoredField.
             * @member {testapi.extensions.PrefixedMessage.IInnerMessage|null|undefined} ignoredField
             * @memberof testapi.extensions.PrefixedMessage
             * @instance
             */
            PrefixedMessage.prototype.ignoredField = null;

            /**
             * Creates a new PrefixedMessage instance using the specified properties.
             * @function create
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {testapi.extensions.IPrefixedMessage=} [properties] Properties to set
             * @returns {testapi.extensions.PrefixedMessage} PrefixedMessage instance
             */
            PrefixedMessage.create = function create(properties) {
                return new PrefixedMessage(properties);
            };

            /**
             * Encodes the specified PrefixedMessage message. Does not implicitly {@link testapi.extensions.PrefixedMessage.verify|verify} messages.
             * @function encode
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {testapi.extensions.IPrefixedMessage} message PrefixedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PrefixedMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                if (message.prefixedEnum != null && Object.hasOwnProperty.call(message, "prefixedEnum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.prefixedEnum);
                if (message.ignoredField != null && Object.hasOwnProperty.call(message, "ignoredField"))
                    $root.testapi.extensions.PrefixedMessage.InnerMessage.encode(message.ignoredField, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PrefixedMessage message, length delimited. Does not implicitly {@link testapi.extensions.PrefixedMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {testapi.extensions.IPrefixedMessage} message PrefixedMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PrefixedMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PrefixedMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.extensions.PrefixedMessage} PrefixedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PrefixedMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.extensions.PrefixedMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = reader.string();
                        break;
                    case 2:
                        message.prefixedEnum = reader.int32();
                        break;
                    case 3:
                        message.ignoredField = $root.testapi.extensions.PrefixedMessage.InnerMessage.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PrefixedMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.extensions.PrefixedMessage} PrefixedMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PrefixedMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PrefixedMessage message.
             * @function verify
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PrefixedMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                if (message.prefixedEnum != null && message.hasOwnProperty("prefixedEnum"))
                    switch (message.prefixedEnum) {
                    default:
                        return "prefixedEnum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.ignoredField != null && message.hasOwnProperty("ignoredField")) {
                    var error = $root.testapi.extensions.PrefixedMessage.InnerMessage.verify(message.ignoredField);
                    if (error)
                        return "ignoredField." + error;
                }
                return null;
            };

            /**
             * Creates a PrefixedMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.extensions.PrefixedMessage} PrefixedMessage
             */
            PrefixedMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.extensions.PrefixedMessage)
                    return object;
                var message = new $root.testapi.extensions.PrefixedMessage();
                if (object.body != null)
                    message.body = String(object.body);
                switch (object.prefixedEnum) {
                case "PREFIXED_ENUM_UNSPECIFIED":
                case 0:
                    message.prefixedEnum = 0;
                    break;
                case "PREFIXED_FOO":
                case 1:
                    message.prefixedEnum = 1;
                    break;
                case "PREFIXED_BAR":
                case 2:
                    message.prefixedEnum = 2;
                    break;
                }
                if (object.ignoredField != null) {
                    if (typeof object.ignoredField !== "object")
                        throw TypeError(".testapi.extensions.PrefixedMessage.ignoredField: object expected");
                    message.ignoredField = $root.testapi.extensions.PrefixedMessage.InnerMessage.fromObject(object.ignoredField);
                }
                return message;
            };

            /**
             * Creates a plain object from a PrefixedMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.extensions.PrefixedMessage
             * @static
             * @param {testapi.extensions.PrefixedMessage} message PrefixedMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PrefixedMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.body = "";
                    object.prefixedEnum = options.enums === String ? "PREFIXED_ENUM_UNSPECIFIED" : 0;
                    object.ignoredField = null;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = message.body;
                if (message.prefixedEnum != null && message.hasOwnProperty("prefixedEnum"))
                    object.prefixedEnum = options.enums === String ? $root.testapi.extensions.PrefixedEnum[message.prefixedEnum] : message.prefixedEnum;
                if (message.ignoredField != null && message.hasOwnProperty("ignoredField"))
                    object.ignoredField = $root.testapi.extensions.PrefixedMessage.InnerMessage.toObject(message.ignoredField, options);
                return object;
            };

            /**
             * Converts this PrefixedMessage to JSON.
             * @function toJSON
             * @memberof testapi.extensions.PrefixedMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PrefixedMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            PrefixedMessage.InnerMessage = (function() {

                /**
                 * Properties of an InnerMessage.
                 * @memberof testapi.extensions.PrefixedMessage
                 * @interface IInnerMessage
                 * @property {string|null} [body] InnerMessage body
                 */

                /**
                 * Constructs a new InnerMessage.
                 * @memberof testapi.extensions.PrefixedMessage
                 * @classdesc Represents an InnerMessage.
                 * @implements IInnerMessage
                 * @constructor
                 * @param {testapi.extensions.PrefixedMessage.IInnerMessage=} [properties] Properties to set
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
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @instance
                 */
                InnerMessage.prototype.body = "";

                /**
                 * Creates a new InnerMessage instance using the specified properties.
                 * @function create
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {testapi.extensions.PrefixedMessage.IInnerMessage=} [properties] Properties to set
                 * @returns {testapi.extensions.PrefixedMessage.InnerMessage} InnerMessage instance
                 */
                InnerMessage.create = function create(properties) {
                    return new InnerMessage(properties);
                };

                /**
                 * Encodes the specified InnerMessage message. Does not implicitly {@link testapi.extensions.PrefixedMessage.InnerMessage.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {testapi.extensions.PrefixedMessage.IInnerMessage} message InnerMessage message or plain object to encode
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
                 * Encodes the specified InnerMessage message, length delimited. Does not implicitly {@link testapi.extensions.PrefixedMessage.InnerMessage.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {testapi.extensions.PrefixedMessage.IInnerMessage} message InnerMessage message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                InnerMessage.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an InnerMessage message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.extensions.PrefixedMessage.InnerMessage} InnerMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                InnerMessage.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.extensions.PrefixedMessage.InnerMessage();
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
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.extensions.PrefixedMessage.InnerMessage} InnerMessage
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
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
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
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.extensions.PrefixedMessage.InnerMessage} InnerMessage
                 */
                InnerMessage.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.extensions.PrefixedMessage.InnerMessage)
                        return object;
                    var message = new $root.testapi.extensions.PrefixedMessage.InnerMessage();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from an InnerMessage message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @static
                 * @param {testapi.extensions.PrefixedMessage.InnerMessage} message InnerMessage
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
                 * @memberof testapi.extensions.PrefixedMessage.InnerMessage
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                InnerMessage.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return InnerMessage;
            })();

            return PrefixedMessage;
        })();

        /**
         * PrefixedEnum enum.
         * @name testapi.extensions.PrefixedEnum
         * @enum {number}
         * @property {number} PREFIXED_ENUM_UNSPECIFIED=0 PREFIXED_ENUM_UNSPECIFIED value
         * @property {number} PREFIXED_FOO=1 PREFIXED_FOO value
         * @property {number} PREFIXED_BAR=2 PREFIXED_BAR value
         */
        extensions.PrefixedEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PREFIXED_ENUM_UNSPECIFIED"] = 0;
            values[valuesById[1] = "PREFIXED_FOO"] = 1;
            values[valuesById[2] = "PREFIXED_BAR"] = 2;
            return values;
        })();

        return extensions;
    })();

    return testapi;
})();

module.exports = $root;
