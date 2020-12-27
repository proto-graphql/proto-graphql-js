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

    testapi.enums = (function() {

        /**
         * Namespace enums.
         * @memberof testapi
         * @namespace
         */
        var enums = {};

        enums.MessageWithEnums = (function() {

            /**
             * Properties of a MessageWithEnums.
             * @memberof testapi.enums
             * @interface IMessageWithEnums
             * @property {testapi.enums.MyEnum|null} [requiredMyEnum] MessageWithEnums requiredMyEnum
             * @property {testapi.enums.MyEnum|null} [optionalMyEnum] MessageWithEnums optionalMyEnum
             * @property {testapi.enums.MyEnumWithoutUnspecified|null} [requiredMyEnumWithoutUnspecified] MessageWithEnums requiredMyEnumWithoutUnspecified
             * @property {testapi.enums.MyEnumWithoutUnspecified|null} [optionalMyEnumWithoutUnspecified] MessageWithEnums optionalMyEnumWithoutUnspecified
             */

            /**
             * Constructs a new MessageWithEnums.
             * @memberof testapi.enums
             * @classdesc Represents a MessageWithEnums.
             * @implements IMessageWithEnums
             * @constructor
             * @param {testapi.enums.IMessageWithEnums=} [properties] Properties to set
             */
            function MessageWithEnums(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MessageWithEnums requiredMyEnum.
             * @member {testapi.enums.MyEnum} requiredMyEnum
             * @memberof testapi.enums.MessageWithEnums
             * @instance
             */
            MessageWithEnums.prototype.requiredMyEnum = 0;

            /**
             * MessageWithEnums optionalMyEnum.
             * @member {testapi.enums.MyEnum} optionalMyEnum
             * @memberof testapi.enums.MessageWithEnums
             * @instance
             */
            MessageWithEnums.prototype.optionalMyEnum = 0;

            /**
             * MessageWithEnums requiredMyEnumWithoutUnspecified.
             * @member {testapi.enums.MyEnumWithoutUnspecified} requiredMyEnumWithoutUnspecified
             * @memberof testapi.enums.MessageWithEnums
             * @instance
             */
            MessageWithEnums.prototype.requiredMyEnumWithoutUnspecified = 0;

            /**
             * MessageWithEnums optionalMyEnumWithoutUnspecified.
             * @member {testapi.enums.MyEnumWithoutUnspecified} optionalMyEnumWithoutUnspecified
             * @memberof testapi.enums.MessageWithEnums
             * @instance
             */
            MessageWithEnums.prototype.optionalMyEnumWithoutUnspecified = 0;

            /**
             * Creates a new MessageWithEnums instance using the specified properties.
             * @function create
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {testapi.enums.IMessageWithEnums=} [properties] Properties to set
             * @returns {testapi.enums.MessageWithEnums} MessageWithEnums instance
             */
            MessageWithEnums.create = function create(properties) {
                return new MessageWithEnums(properties);
            };

            /**
             * Encodes the specified MessageWithEnums message. Does not implicitly {@link testapi.enums.MessageWithEnums.verify|verify} messages.
             * @function encode
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {testapi.enums.IMessageWithEnums} message MessageWithEnums message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageWithEnums.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requiredMyEnum != null && Object.hasOwnProperty.call(message, "requiredMyEnum"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.requiredMyEnum);
                if (message.optionalMyEnum != null && Object.hasOwnProperty.call(message, "optionalMyEnum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.optionalMyEnum);
                if (message.requiredMyEnumWithoutUnspecified != null && Object.hasOwnProperty.call(message, "requiredMyEnumWithoutUnspecified"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.requiredMyEnumWithoutUnspecified);
                if (message.optionalMyEnumWithoutUnspecified != null && Object.hasOwnProperty.call(message, "optionalMyEnumWithoutUnspecified"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.optionalMyEnumWithoutUnspecified);
                return writer;
            };

            /**
             * Encodes the specified MessageWithEnums message, length delimited. Does not implicitly {@link testapi.enums.MessageWithEnums.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {testapi.enums.IMessageWithEnums} message MessageWithEnums message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageWithEnums.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MessageWithEnums message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.enums.MessageWithEnums} MessageWithEnums
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageWithEnums.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.enums.MessageWithEnums();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.requiredMyEnum = reader.int32();
                        break;
                    case 2:
                        message.optionalMyEnum = reader.int32();
                        break;
                    case 3:
                        message.requiredMyEnumWithoutUnspecified = reader.int32();
                        break;
                    case 4:
                        message.optionalMyEnumWithoutUnspecified = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a MessageWithEnums message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.enums.MessageWithEnums} MessageWithEnums
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageWithEnums.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MessageWithEnums message.
             * @function verify
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MessageWithEnums.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requiredMyEnum != null && message.hasOwnProperty("requiredMyEnum"))
                    switch (message.requiredMyEnum) {
                    default:
                        return "requiredMyEnum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.optionalMyEnum != null && message.hasOwnProperty("optionalMyEnum"))
                    switch (message.optionalMyEnum) {
                    default:
                        return "optionalMyEnum: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.requiredMyEnumWithoutUnspecified != null && message.hasOwnProperty("requiredMyEnumWithoutUnspecified"))
                    switch (message.requiredMyEnumWithoutUnspecified) {
                    default:
                        return "requiredMyEnumWithoutUnspecified: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.optionalMyEnumWithoutUnspecified != null && message.hasOwnProperty("optionalMyEnumWithoutUnspecified"))
                    switch (message.optionalMyEnumWithoutUnspecified) {
                    default:
                        return "optionalMyEnumWithoutUnspecified: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a MessageWithEnums message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.enums.MessageWithEnums} MessageWithEnums
             */
            MessageWithEnums.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.enums.MessageWithEnums)
                    return object;
                var message = new $root.testapi.enums.MessageWithEnums();
                switch (object.requiredMyEnum) {
                case "MY_ENUM_UNSPECIFIED":
                case 0:
                    message.requiredMyEnum = 0;
                    break;
                case "MY_ENUM_FOO":
                case 1:
                    message.requiredMyEnum = 1;
                    break;
                case "MY_ENUM_BAR":
                case 2:
                    message.requiredMyEnum = 2;
                    break;
                case "MY_ENUM_BAZ":
                case 3:
                    message.requiredMyEnum = 3;
                    break;
                }
                switch (object.optionalMyEnum) {
                case "MY_ENUM_UNSPECIFIED":
                case 0:
                    message.optionalMyEnum = 0;
                    break;
                case "MY_ENUM_FOO":
                case 1:
                    message.optionalMyEnum = 1;
                    break;
                case "MY_ENUM_BAR":
                case 2:
                    message.optionalMyEnum = 2;
                    break;
                case "MY_ENUM_BAZ":
                case 3:
                    message.optionalMyEnum = 3;
                    break;
                }
                switch (object.requiredMyEnumWithoutUnspecified) {
                case "MY_ENUM_WITHOUT_UNSPECIFIED_FOO":
                case 0:
                    message.requiredMyEnumWithoutUnspecified = 0;
                    break;
                case "MY_ENUM_WITHOUT_UNSPECIFIED_BAR":
                case 1:
                    message.requiredMyEnumWithoutUnspecified = 1;
                    break;
                case "MY_ENUM_WITHOUT_UNSPECIFIED_BAZ":
                case 2:
                    message.requiredMyEnumWithoutUnspecified = 2;
                    break;
                }
                switch (object.optionalMyEnumWithoutUnspecified) {
                case "MY_ENUM_WITHOUT_UNSPECIFIED_FOO":
                case 0:
                    message.optionalMyEnumWithoutUnspecified = 0;
                    break;
                case "MY_ENUM_WITHOUT_UNSPECIFIED_BAR":
                case 1:
                    message.optionalMyEnumWithoutUnspecified = 1;
                    break;
                case "MY_ENUM_WITHOUT_UNSPECIFIED_BAZ":
                case 2:
                    message.optionalMyEnumWithoutUnspecified = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a MessageWithEnums message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.enums.MessageWithEnums
             * @static
             * @param {testapi.enums.MessageWithEnums} message MessageWithEnums
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MessageWithEnums.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.requiredMyEnum = options.enums === String ? "MY_ENUM_UNSPECIFIED" : 0;
                    object.optionalMyEnum = options.enums === String ? "MY_ENUM_UNSPECIFIED" : 0;
                    object.requiredMyEnumWithoutUnspecified = options.enums === String ? "MY_ENUM_WITHOUT_UNSPECIFIED_FOO" : 0;
                    object.optionalMyEnumWithoutUnspecified = options.enums === String ? "MY_ENUM_WITHOUT_UNSPECIFIED_FOO" : 0;
                }
                if (message.requiredMyEnum != null && message.hasOwnProperty("requiredMyEnum"))
                    object.requiredMyEnum = options.enums === String ? $root.testapi.enums.MyEnum[message.requiredMyEnum] : message.requiredMyEnum;
                if (message.optionalMyEnum != null && message.hasOwnProperty("optionalMyEnum"))
                    object.optionalMyEnum = options.enums === String ? $root.testapi.enums.MyEnum[message.optionalMyEnum] : message.optionalMyEnum;
                if (message.requiredMyEnumWithoutUnspecified != null && message.hasOwnProperty("requiredMyEnumWithoutUnspecified"))
                    object.requiredMyEnumWithoutUnspecified = options.enums === String ? $root.testapi.enums.MyEnumWithoutUnspecified[message.requiredMyEnumWithoutUnspecified] : message.requiredMyEnumWithoutUnspecified;
                if (message.optionalMyEnumWithoutUnspecified != null && message.hasOwnProperty("optionalMyEnumWithoutUnspecified"))
                    object.optionalMyEnumWithoutUnspecified = options.enums === String ? $root.testapi.enums.MyEnumWithoutUnspecified[message.optionalMyEnumWithoutUnspecified] : message.optionalMyEnumWithoutUnspecified;
                return object;
            };

            /**
             * Converts this MessageWithEnums to JSON.
             * @function toJSON
             * @memberof testapi.enums.MessageWithEnums
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MessageWithEnums.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return MessageWithEnums;
        })();

        /**
         * MyEnum enum.
         * @name testapi.enums.MyEnum
         * @enum {number}
         * @property {number} MY_ENUM_UNSPECIFIED=0 MY_ENUM_UNSPECIFIED value
         * @property {number} MY_ENUM_FOO=1 MY_ENUM_FOO value
         * @property {number} MY_ENUM_BAR=2 MY_ENUM_BAR value
         * @property {number} MY_ENUM_BAZ=3 MY_ENUM_BAZ value
         */
        enums.MyEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "MY_ENUM_UNSPECIFIED"] = 0;
            values[valuesById[1] = "MY_ENUM_FOO"] = 1;
            values[valuesById[2] = "MY_ENUM_BAR"] = 2;
            values[valuesById[3] = "MY_ENUM_BAZ"] = 3;
            return values;
        })();

        /**
         * MyEnumWithoutUnspecified enum.
         * @name testapi.enums.MyEnumWithoutUnspecified
         * @enum {number}
         * @property {number} MY_ENUM_WITHOUT_UNSPECIFIED_FOO=0 MY_ENUM_WITHOUT_UNSPECIFIED_FOO value
         * @property {number} MY_ENUM_WITHOUT_UNSPECIFIED_BAR=1 MY_ENUM_WITHOUT_UNSPECIFIED_BAR value
         * @property {number} MY_ENUM_WITHOUT_UNSPECIFIED_BAZ=2 MY_ENUM_WITHOUT_UNSPECIFIED_BAZ value
         */
        enums.MyEnumWithoutUnspecified = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "MY_ENUM_WITHOUT_UNSPECIFIED_FOO"] = 0;
            values[valuesById[1] = "MY_ENUM_WITHOUT_UNSPECIFIED_BAR"] = 1;
            values[valuesById[2] = "MY_ENUM_WITHOUT_UNSPECIFIED_BAZ"] = 2;
            return values;
        })();

        return enums;
    })();

    return testapi;
})();

module.exports = $root;
