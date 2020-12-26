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

    testapi.nested = (function() {

        /**
         * Namespace nested.
         * @memberof testapi
         * @namespace
         */
        var nested = {};

        nested.MessageWithEnums = (function() {

            /**
             * Properties of a MessageWithEnums.
             * @memberof testapi.nested
             * @interface IMessageWithEnums
             * @property {testapi.nested.MyEnum1|null} [myEnum_1] MessageWithEnums myEnum_1
             */

            /**
             * Constructs a new MessageWithEnums.
             * @memberof testapi.nested
             * @classdesc Represents a MessageWithEnums.
             * @implements IMessageWithEnums
             * @constructor
             * @param {testapi.nested.IMessageWithEnums=} [properties] Properties to set
             */
            function MessageWithEnums(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MessageWithEnums myEnum_1.
             * @member {testapi.nested.MyEnum1} myEnum_1
             * @memberof testapi.nested.MessageWithEnums
             * @instance
             */
            MessageWithEnums.prototype.myEnum_1 = 0;

            /**
             * Creates a new MessageWithEnums instance using the specified properties.
             * @function create
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {testapi.nested.IMessageWithEnums=} [properties] Properties to set
             * @returns {testapi.nested.MessageWithEnums} MessageWithEnums instance
             */
            MessageWithEnums.create = function create(properties) {
                return new MessageWithEnums(properties);
            };

            /**
             * Encodes the specified MessageWithEnums message. Does not implicitly {@link testapi.nested.MessageWithEnums.verify|verify} messages.
             * @function encode
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {testapi.nested.IMessageWithEnums} message MessageWithEnums message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageWithEnums.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.myEnum_1 != null && Object.hasOwnProperty.call(message, "myEnum_1"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.myEnum_1);
                return writer;
            };

            /**
             * Encodes the specified MessageWithEnums message, length delimited. Does not implicitly {@link testapi.nested.MessageWithEnums.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {testapi.nested.IMessageWithEnums} message MessageWithEnums message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MessageWithEnums.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MessageWithEnums message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.nested.MessageWithEnums} MessageWithEnums
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MessageWithEnums.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.nested.MessageWithEnums();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.myEnum_1 = reader.int32();
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
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.nested.MessageWithEnums} MessageWithEnums
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
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MessageWithEnums.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.myEnum_1 != null && message.hasOwnProperty("myEnum_1"))
                    switch (message.myEnum_1) {
                    default:
                        return "myEnum_1: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                return null;
            };

            /**
             * Creates a MessageWithEnums message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.nested.MessageWithEnums} MessageWithEnums
             */
            MessageWithEnums.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.nested.MessageWithEnums)
                    return object;
                var message = new $root.testapi.nested.MessageWithEnums();
                switch (object.myEnum_1) {
                case "MY_ENUM_1_UNSPECIRED":
                case 0:
                    message.myEnum_1 = 0;
                    break;
                case "FOO":
                case 1:
                    message.myEnum_1 = 1;
                    break;
                case "BAR":
                case 2:
                    message.myEnum_1 = 2;
                    break;
                case "BAZ":
                case 3:
                    message.myEnum_1 = 3;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a MessageWithEnums message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.nested.MessageWithEnums
             * @static
             * @param {testapi.nested.MessageWithEnums} message MessageWithEnums
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MessageWithEnums.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.myEnum_1 = options.enums === String ? "MY_ENUM_1_UNSPECIRED" : 0;
                if (message.myEnum_1 != null && message.hasOwnProperty("myEnum_1"))
                    object.myEnum_1 = options.enums === String ? $root.testapi.nested.MyEnum1[message.myEnum_1] : message.myEnum_1;
                return object;
            };

            /**
             * Converts this MessageWithEnums to JSON.
             * @function toJSON
             * @memberof testapi.nested.MessageWithEnums
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MessageWithEnums.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return MessageWithEnums;
        })();

        /**
         * MyEnum1 enum.
         * @name testapi.nested.MyEnum1
         * @enum {number}
         * @property {number} MY_ENUM_1_UNSPECIRED=0 MY_ENUM_1_UNSPECIRED value
         * @property {number} FOO=1 FOO value
         * @property {number} BAR=2 BAR value
         * @property {number} BAZ=3 BAZ value
         */
        nested.MyEnum1 = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "MY_ENUM_1_UNSPECIRED"] = 0;
            values[valuesById[1] = "FOO"] = 1;
            values[valuesById[2] = "BAR"] = 2;
            values[valuesById[3] = "BAZ"] = 3;
            return values;
        })();

        return nested;
    })();

    return testapi;
})();

module.exports = $root;
