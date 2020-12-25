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

    testapi.hello = (function() {

        /**
         * Namespace hello.
         * @memberof testapi
         * @namespace
         */
        var hello = {};

        hello.Hello = (function() {

            /**
             * Properties of a Hello.
             * @memberof testapi.hello
             * @interface IHello
             * @property {testapi.hello.IPrimitives|null} [requiredPrimitives] Hello requiredPrimitives
             * @property {testapi.hello.IPrimitives|null} [optionalPrimitives] Hello optionalPrimitives
             * @property {Array.<testapi.hello.IPrimitives>|null} [requiredPrimitivesList] Hello requiredPrimitivesList
             * @property {testapi.hello.IPrimitives|null} [optionalPrimitivesList] Hello optionalPrimitivesList
             */

            /**
             * Constructs a new Hello.
             * @memberof testapi.hello
             * @classdesc Represents a Hello.
             * @implements IHello
             * @constructor
             * @param {testapi.hello.IHello=} [properties] Properties to set
             */
            function Hello(properties) {
                this.requiredPrimitivesList = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Hello requiredPrimitives.
             * @member {testapi.hello.IPrimitives|null|undefined} requiredPrimitives
             * @memberof testapi.hello.Hello
             * @instance
             */
            Hello.prototype.requiredPrimitives = null;

            /**
             * Hello optionalPrimitives.
             * @member {testapi.hello.IPrimitives|null|undefined} optionalPrimitives
             * @memberof testapi.hello.Hello
             * @instance
             */
            Hello.prototype.optionalPrimitives = null;

            /**
             * Hello requiredPrimitivesList.
             * @member {Array.<testapi.hello.IPrimitives>} requiredPrimitivesList
             * @memberof testapi.hello.Hello
             * @instance
             */
            Hello.prototype.requiredPrimitivesList = $util.emptyArray;

            /**
             * Hello optionalPrimitivesList.
             * @member {testapi.hello.IPrimitives|null|undefined} optionalPrimitivesList
             * @memberof testapi.hello.Hello
             * @instance
             */
            Hello.prototype.optionalPrimitivesList = null;

            /**
             * Creates a new Hello instance using the specified properties.
             * @function create
             * @memberof testapi.hello.Hello
             * @static
             * @param {testapi.hello.IHello=} [properties] Properties to set
             * @returns {testapi.hello.Hello} Hello instance
             */
            Hello.create = function create(properties) {
                return new Hello(properties);
            };

            /**
             * Encodes the specified Hello message. Does not implicitly {@link testapi.hello.Hello.verify|verify} messages.
             * @function encode
             * @memberof testapi.hello.Hello
             * @static
             * @param {testapi.hello.IHello} message Hello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hello.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requiredPrimitives != null && Object.hasOwnProperty.call(message, "requiredPrimitives"))
                    $root.testapi.hello.Primitives.encode(message.requiredPrimitives, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.optionalPrimitives != null && Object.hasOwnProperty.call(message, "optionalPrimitives"))
                    $root.testapi.hello.Primitives.encode(message.optionalPrimitives, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.requiredPrimitivesList != null && message.requiredPrimitivesList.length)
                    for (var i = 0; i < message.requiredPrimitivesList.length; ++i)
                        $root.testapi.hello.Primitives.encode(message.requiredPrimitivesList[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.optionalPrimitivesList != null && Object.hasOwnProperty.call(message, "optionalPrimitivesList"))
                    $root.testapi.hello.Primitives.encode(message.optionalPrimitivesList, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Hello message, length delimited. Does not implicitly {@link testapi.hello.Hello.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.hello.Hello
             * @static
             * @param {testapi.hello.IHello} message Hello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hello.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Hello message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.hello.Hello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.hello.Hello} Hello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hello.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.hello.Hello();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.requiredPrimitives = $root.testapi.hello.Primitives.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.optionalPrimitives = $root.testapi.hello.Primitives.decode(reader, reader.uint32());
                        break;
                    case 3:
                        if (!(message.requiredPrimitivesList && message.requiredPrimitivesList.length))
                            message.requiredPrimitivesList = [];
                        message.requiredPrimitivesList.push($root.testapi.hello.Primitives.decode(reader, reader.uint32()));
                        break;
                    case 4:
                        message.optionalPrimitivesList = $root.testapi.hello.Primitives.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Hello message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.hello.Hello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.hello.Hello} Hello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hello.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Hello message.
             * @function verify
             * @memberof testapi.hello.Hello
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Hello.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requiredPrimitives != null && message.hasOwnProperty("requiredPrimitives")) {
                    var error = $root.testapi.hello.Primitives.verify(message.requiredPrimitives);
                    if (error)
                        return "requiredPrimitives." + error;
                }
                if (message.optionalPrimitives != null && message.hasOwnProperty("optionalPrimitives")) {
                    var error = $root.testapi.hello.Primitives.verify(message.optionalPrimitives);
                    if (error)
                        return "optionalPrimitives." + error;
                }
                if (message.requiredPrimitivesList != null && message.hasOwnProperty("requiredPrimitivesList")) {
                    if (!Array.isArray(message.requiredPrimitivesList))
                        return "requiredPrimitivesList: array expected";
                    for (var i = 0; i < message.requiredPrimitivesList.length; ++i) {
                        var error = $root.testapi.hello.Primitives.verify(message.requiredPrimitivesList[i]);
                        if (error)
                            return "requiredPrimitivesList." + error;
                    }
                }
                if (message.optionalPrimitivesList != null && message.hasOwnProperty("optionalPrimitivesList")) {
                    var error = $root.testapi.hello.Primitives.verify(message.optionalPrimitivesList);
                    if (error)
                        return "optionalPrimitivesList." + error;
                }
                return null;
            };

            /**
             * Creates a Hello message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.hello.Hello
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.hello.Hello} Hello
             */
            Hello.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.hello.Hello)
                    return object;
                var message = new $root.testapi.hello.Hello();
                if (object.requiredPrimitives != null) {
                    if (typeof object.requiredPrimitives !== "object")
                        throw TypeError(".testapi.hello.Hello.requiredPrimitives: object expected");
                    message.requiredPrimitives = $root.testapi.hello.Primitives.fromObject(object.requiredPrimitives);
                }
                if (object.optionalPrimitives != null) {
                    if (typeof object.optionalPrimitives !== "object")
                        throw TypeError(".testapi.hello.Hello.optionalPrimitives: object expected");
                    message.optionalPrimitives = $root.testapi.hello.Primitives.fromObject(object.optionalPrimitives);
                }
                if (object.requiredPrimitivesList) {
                    if (!Array.isArray(object.requiredPrimitivesList))
                        throw TypeError(".testapi.hello.Hello.requiredPrimitivesList: array expected");
                    message.requiredPrimitivesList = [];
                    for (var i = 0; i < object.requiredPrimitivesList.length; ++i) {
                        if (typeof object.requiredPrimitivesList[i] !== "object")
                            throw TypeError(".testapi.hello.Hello.requiredPrimitivesList: object expected");
                        message.requiredPrimitivesList[i] = $root.testapi.hello.Primitives.fromObject(object.requiredPrimitivesList[i]);
                    }
                }
                if (object.optionalPrimitivesList != null) {
                    if (typeof object.optionalPrimitivesList !== "object")
                        throw TypeError(".testapi.hello.Hello.optionalPrimitivesList: object expected");
                    message.optionalPrimitivesList = $root.testapi.hello.Primitives.fromObject(object.optionalPrimitivesList);
                }
                return message;
            };

            /**
             * Creates a plain object from a Hello message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.hello.Hello
             * @static
             * @param {testapi.hello.Hello} message Hello
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Hello.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.requiredPrimitivesList = [];
                if (options.defaults) {
                    object.requiredPrimitives = null;
                    object.optionalPrimitives = null;
                    object.optionalPrimitivesList = null;
                }
                if (message.requiredPrimitives != null && message.hasOwnProperty("requiredPrimitives"))
                    object.requiredPrimitives = $root.testapi.hello.Primitives.toObject(message.requiredPrimitives, options);
                if (message.optionalPrimitives != null && message.hasOwnProperty("optionalPrimitives"))
                    object.optionalPrimitives = $root.testapi.hello.Primitives.toObject(message.optionalPrimitives, options);
                if (message.requiredPrimitivesList && message.requiredPrimitivesList.length) {
                    object.requiredPrimitivesList = [];
                    for (var j = 0; j < message.requiredPrimitivesList.length; ++j)
                        object.requiredPrimitivesList[j] = $root.testapi.hello.Primitives.toObject(message.requiredPrimitivesList[j], options);
                }
                if (message.optionalPrimitivesList != null && message.hasOwnProperty("optionalPrimitivesList"))
                    object.optionalPrimitivesList = $root.testapi.hello.Primitives.toObject(message.optionalPrimitivesList, options);
                return object;
            };

            /**
             * Converts this Hello to JSON.
             * @function toJSON
             * @memberof testapi.hello.Hello
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Hello.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Hello;
        })();

        hello.Primitives = (function() {

            /**
             * Properties of a Primitives.
             * @memberof testapi.hello
             * @interface IPrimitives
             * @property {number|null} [requiredDoubleValue] Primitives requiredDoubleValue
             * @property {number|null} [requiredFloatValue] Primitives requiredFloatValue
             * @property {number|null} [requiredInt32Value] Primitives requiredInt32Value
             * @property {number|Long|null} [requiredInt64Value] Primitives requiredInt64Value
             * @property {number|null} [requiredUint32Value] Primitives requiredUint32Value
             * @property {number|Long|null} [requiredUint64Value] Primitives requiredUint64Value
             * @property {number|null} [requiredSint32Value] Primitives requiredSint32Value
             * @property {number|Long|null} [requiredSint64Value] Primitives requiredSint64Value
             * @property {number|null} [requiredFixed32Value] Primitives requiredFixed32Value
             * @property {number|Long|null} [requiredFixed64Value] Primitives requiredFixed64Value
             * @property {number|null} [requiredSfixed32Value] Primitives requiredSfixed32Value
             * @property {number|Long|null} [requiredSfixed64Value] Primitives requiredSfixed64Value
             * @property {boolean|null} [requiredBoolValue] Primitives requiredBoolValue
             * @property {string|null} [requiredStringValue] Primitives requiredStringValue
             */

            /**
             * Constructs a new Primitives.
             * @memberof testapi.hello
             * @classdesc Represents a Primitives.
             * @implements IPrimitives
             * @constructor
             * @param {testapi.hello.IPrimitives=} [properties] Properties to set
             */
            function Primitives(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Primitives requiredDoubleValue.
             * @member {number} requiredDoubleValue
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredDoubleValue = 0;

            /**
             * Primitives requiredFloatValue.
             * @member {number} requiredFloatValue
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredFloatValue = 0;

            /**
             * Primitives requiredInt32Value.
             * @member {number} requiredInt32Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredInt32Value = 0;

            /**
             * Primitives requiredInt64Value.
             * @member {number|Long} requiredInt64Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredInt64Value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Primitives requiredUint32Value.
             * @member {number} requiredUint32Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredUint32Value = 0;

            /**
             * Primitives requiredUint64Value.
             * @member {number|Long} requiredUint64Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredUint64Value = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Primitives requiredSint32Value.
             * @member {number} requiredSint32Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredSint32Value = 0;

            /**
             * Primitives requiredSint64Value.
             * @member {number|Long} requiredSint64Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredSint64Value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Primitives requiredFixed32Value.
             * @member {number} requiredFixed32Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredFixed32Value = 0;

            /**
             * Primitives requiredFixed64Value.
             * @member {number|Long} requiredFixed64Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredFixed64Value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Primitives requiredSfixed32Value.
             * @member {number} requiredSfixed32Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredSfixed32Value = 0;

            /**
             * Primitives requiredSfixed64Value.
             * @member {number|Long} requiredSfixed64Value
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredSfixed64Value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Primitives requiredBoolValue.
             * @member {boolean} requiredBoolValue
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredBoolValue = false;

            /**
             * Primitives requiredStringValue.
             * @member {string} requiredStringValue
             * @memberof testapi.hello.Primitives
             * @instance
             */
            Primitives.prototype.requiredStringValue = "";

            /**
             * Creates a new Primitives instance using the specified properties.
             * @function create
             * @memberof testapi.hello.Primitives
             * @static
             * @param {testapi.hello.IPrimitives=} [properties] Properties to set
             * @returns {testapi.hello.Primitives} Primitives instance
             */
            Primitives.create = function create(properties) {
                return new Primitives(properties);
            };

            /**
             * Encodes the specified Primitives message. Does not implicitly {@link testapi.hello.Primitives.verify|verify} messages.
             * @function encode
             * @memberof testapi.hello.Primitives
             * @static
             * @param {testapi.hello.IPrimitives} message Primitives message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Primitives.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requiredDoubleValue != null && Object.hasOwnProperty.call(message, "requiredDoubleValue"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.requiredDoubleValue);
                if (message.requiredFloatValue != null && Object.hasOwnProperty.call(message, "requiredFloatValue"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.requiredFloatValue);
                if (message.requiredInt32Value != null && Object.hasOwnProperty.call(message, "requiredInt32Value"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.requiredInt32Value);
                if (message.requiredInt64Value != null && Object.hasOwnProperty.call(message, "requiredInt64Value"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.requiredInt64Value);
                if (message.requiredUint32Value != null && Object.hasOwnProperty.call(message, "requiredUint32Value"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.requiredUint32Value);
                if (message.requiredUint64Value != null && Object.hasOwnProperty.call(message, "requiredUint64Value"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.requiredUint64Value);
                if (message.requiredSint32Value != null && Object.hasOwnProperty.call(message, "requiredSint32Value"))
                    writer.uint32(/* id 7, wireType 0 =*/56).sint32(message.requiredSint32Value);
                if (message.requiredSint64Value != null && Object.hasOwnProperty.call(message, "requiredSint64Value"))
                    writer.uint32(/* id 8, wireType 0 =*/64).sint64(message.requiredSint64Value);
                if (message.requiredFixed32Value != null && Object.hasOwnProperty.call(message, "requiredFixed32Value"))
                    writer.uint32(/* id 9, wireType 5 =*/77).fixed32(message.requiredFixed32Value);
                if (message.requiredFixed64Value != null && Object.hasOwnProperty.call(message, "requiredFixed64Value"))
                    writer.uint32(/* id 10, wireType 1 =*/81).fixed64(message.requiredFixed64Value);
                if (message.requiredSfixed32Value != null && Object.hasOwnProperty.call(message, "requiredSfixed32Value"))
                    writer.uint32(/* id 11, wireType 5 =*/93).sfixed32(message.requiredSfixed32Value);
                if (message.requiredSfixed64Value != null && Object.hasOwnProperty.call(message, "requiredSfixed64Value"))
                    writer.uint32(/* id 12, wireType 1 =*/97).sfixed64(message.requiredSfixed64Value);
                if (message.requiredBoolValue != null && Object.hasOwnProperty.call(message, "requiredBoolValue"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.requiredBoolValue);
                if (message.requiredStringValue != null && Object.hasOwnProperty.call(message, "requiredStringValue"))
                    writer.uint32(/* id 14, wireType 2 =*/114).string(message.requiredStringValue);
                return writer;
            };

            /**
             * Encodes the specified Primitives message, length delimited. Does not implicitly {@link testapi.hello.Primitives.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.hello.Primitives
             * @static
             * @param {testapi.hello.IPrimitives} message Primitives message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Primitives.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Primitives message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.hello.Primitives
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.hello.Primitives} Primitives
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Primitives.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.hello.Primitives();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.requiredDoubleValue = reader.double();
                        break;
                    case 2:
                        message.requiredFloatValue = reader.float();
                        break;
                    case 3:
                        message.requiredInt32Value = reader.int32();
                        break;
                    case 4:
                        message.requiredInt64Value = reader.int64();
                        break;
                    case 5:
                        message.requiredUint32Value = reader.uint32();
                        break;
                    case 6:
                        message.requiredUint64Value = reader.uint64();
                        break;
                    case 7:
                        message.requiredSint32Value = reader.sint32();
                        break;
                    case 8:
                        message.requiredSint64Value = reader.sint64();
                        break;
                    case 9:
                        message.requiredFixed32Value = reader.fixed32();
                        break;
                    case 10:
                        message.requiredFixed64Value = reader.fixed64();
                        break;
                    case 11:
                        message.requiredSfixed32Value = reader.sfixed32();
                        break;
                    case 12:
                        message.requiredSfixed64Value = reader.sfixed64();
                        break;
                    case 13:
                        message.requiredBoolValue = reader.bool();
                        break;
                    case 14:
                        message.requiredStringValue = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Primitives message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.hello.Primitives
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.hello.Primitives} Primitives
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Primitives.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Primitives message.
             * @function verify
             * @memberof testapi.hello.Primitives
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Primitives.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requiredDoubleValue != null && message.hasOwnProperty("requiredDoubleValue"))
                    if (typeof message.requiredDoubleValue !== "number")
                        return "requiredDoubleValue: number expected";
                if (message.requiredFloatValue != null && message.hasOwnProperty("requiredFloatValue"))
                    if (typeof message.requiredFloatValue !== "number")
                        return "requiredFloatValue: number expected";
                if (message.requiredInt32Value != null && message.hasOwnProperty("requiredInt32Value"))
                    if (!$util.isInteger(message.requiredInt32Value))
                        return "requiredInt32Value: integer expected";
                if (message.requiredInt64Value != null && message.hasOwnProperty("requiredInt64Value"))
                    if (!$util.isInteger(message.requiredInt64Value) && !(message.requiredInt64Value && $util.isInteger(message.requiredInt64Value.low) && $util.isInteger(message.requiredInt64Value.high)))
                        return "requiredInt64Value: integer|Long expected";
                if (message.requiredUint32Value != null && message.hasOwnProperty("requiredUint32Value"))
                    if (!$util.isInteger(message.requiredUint32Value))
                        return "requiredUint32Value: integer expected";
                if (message.requiredUint64Value != null && message.hasOwnProperty("requiredUint64Value"))
                    if (!$util.isInteger(message.requiredUint64Value) && !(message.requiredUint64Value && $util.isInteger(message.requiredUint64Value.low) && $util.isInteger(message.requiredUint64Value.high)))
                        return "requiredUint64Value: integer|Long expected";
                if (message.requiredSint32Value != null && message.hasOwnProperty("requiredSint32Value"))
                    if (!$util.isInteger(message.requiredSint32Value))
                        return "requiredSint32Value: integer expected";
                if (message.requiredSint64Value != null && message.hasOwnProperty("requiredSint64Value"))
                    if (!$util.isInteger(message.requiredSint64Value) && !(message.requiredSint64Value && $util.isInteger(message.requiredSint64Value.low) && $util.isInteger(message.requiredSint64Value.high)))
                        return "requiredSint64Value: integer|Long expected";
                if (message.requiredFixed32Value != null && message.hasOwnProperty("requiredFixed32Value"))
                    if (!$util.isInteger(message.requiredFixed32Value))
                        return "requiredFixed32Value: integer expected";
                if (message.requiredFixed64Value != null && message.hasOwnProperty("requiredFixed64Value"))
                    if (!$util.isInteger(message.requiredFixed64Value) && !(message.requiredFixed64Value && $util.isInteger(message.requiredFixed64Value.low) && $util.isInteger(message.requiredFixed64Value.high)))
                        return "requiredFixed64Value: integer|Long expected";
                if (message.requiredSfixed32Value != null && message.hasOwnProperty("requiredSfixed32Value"))
                    if (!$util.isInteger(message.requiredSfixed32Value))
                        return "requiredSfixed32Value: integer expected";
                if (message.requiredSfixed64Value != null && message.hasOwnProperty("requiredSfixed64Value"))
                    if (!$util.isInteger(message.requiredSfixed64Value) && !(message.requiredSfixed64Value && $util.isInteger(message.requiredSfixed64Value.low) && $util.isInteger(message.requiredSfixed64Value.high)))
                        return "requiredSfixed64Value: integer|Long expected";
                if (message.requiredBoolValue != null && message.hasOwnProperty("requiredBoolValue"))
                    if (typeof message.requiredBoolValue !== "boolean")
                        return "requiredBoolValue: boolean expected";
                if (message.requiredStringValue != null && message.hasOwnProperty("requiredStringValue"))
                    if (!$util.isString(message.requiredStringValue))
                        return "requiredStringValue: string expected";
                return null;
            };

            /**
             * Creates a Primitives message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.hello.Primitives
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.hello.Primitives} Primitives
             */
            Primitives.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.hello.Primitives)
                    return object;
                var message = new $root.testapi.hello.Primitives();
                if (object.requiredDoubleValue != null)
                    message.requiredDoubleValue = Number(object.requiredDoubleValue);
                if (object.requiredFloatValue != null)
                    message.requiredFloatValue = Number(object.requiredFloatValue);
                if (object.requiredInt32Value != null)
                    message.requiredInt32Value = object.requiredInt32Value | 0;
                if (object.requiredInt64Value != null)
                    if ($util.Long)
                        (message.requiredInt64Value = $util.Long.fromValue(object.requiredInt64Value)).unsigned = false;
                    else if (typeof object.requiredInt64Value === "string")
                        message.requiredInt64Value = parseInt(object.requiredInt64Value, 10);
                    else if (typeof object.requiredInt64Value === "number")
                        message.requiredInt64Value = object.requiredInt64Value;
                    else if (typeof object.requiredInt64Value === "object")
                        message.requiredInt64Value = new $util.LongBits(object.requiredInt64Value.low >>> 0, object.requiredInt64Value.high >>> 0).toNumber();
                if (object.requiredUint32Value != null)
                    message.requiredUint32Value = object.requiredUint32Value >>> 0;
                if (object.requiredUint64Value != null)
                    if ($util.Long)
                        (message.requiredUint64Value = $util.Long.fromValue(object.requiredUint64Value)).unsigned = true;
                    else if (typeof object.requiredUint64Value === "string")
                        message.requiredUint64Value = parseInt(object.requiredUint64Value, 10);
                    else if (typeof object.requiredUint64Value === "number")
                        message.requiredUint64Value = object.requiredUint64Value;
                    else if (typeof object.requiredUint64Value === "object")
                        message.requiredUint64Value = new $util.LongBits(object.requiredUint64Value.low >>> 0, object.requiredUint64Value.high >>> 0).toNumber(true);
                if (object.requiredSint32Value != null)
                    message.requiredSint32Value = object.requiredSint32Value | 0;
                if (object.requiredSint64Value != null)
                    if ($util.Long)
                        (message.requiredSint64Value = $util.Long.fromValue(object.requiredSint64Value)).unsigned = false;
                    else if (typeof object.requiredSint64Value === "string")
                        message.requiredSint64Value = parseInt(object.requiredSint64Value, 10);
                    else if (typeof object.requiredSint64Value === "number")
                        message.requiredSint64Value = object.requiredSint64Value;
                    else if (typeof object.requiredSint64Value === "object")
                        message.requiredSint64Value = new $util.LongBits(object.requiredSint64Value.low >>> 0, object.requiredSint64Value.high >>> 0).toNumber();
                if (object.requiredFixed32Value != null)
                    message.requiredFixed32Value = object.requiredFixed32Value >>> 0;
                if (object.requiredFixed64Value != null)
                    if ($util.Long)
                        (message.requiredFixed64Value = $util.Long.fromValue(object.requiredFixed64Value)).unsigned = false;
                    else if (typeof object.requiredFixed64Value === "string")
                        message.requiredFixed64Value = parseInt(object.requiredFixed64Value, 10);
                    else if (typeof object.requiredFixed64Value === "number")
                        message.requiredFixed64Value = object.requiredFixed64Value;
                    else if (typeof object.requiredFixed64Value === "object")
                        message.requiredFixed64Value = new $util.LongBits(object.requiredFixed64Value.low >>> 0, object.requiredFixed64Value.high >>> 0).toNumber();
                if (object.requiredSfixed32Value != null)
                    message.requiredSfixed32Value = object.requiredSfixed32Value | 0;
                if (object.requiredSfixed64Value != null)
                    if ($util.Long)
                        (message.requiredSfixed64Value = $util.Long.fromValue(object.requiredSfixed64Value)).unsigned = false;
                    else if (typeof object.requiredSfixed64Value === "string")
                        message.requiredSfixed64Value = parseInt(object.requiredSfixed64Value, 10);
                    else if (typeof object.requiredSfixed64Value === "number")
                        message.requiredSfixed64Value = object.requiredSfixed64Value;
                    else if (typeof object.requiredSfixed64Value === "object")
                        message.requiredSfixed64Value = new $util.LongBits(object.requiredSfixed64Value.low >>> 0, object.requiredSfixed64Value.high >>> 0).toNumber();
                if (object.requiredBoolValue != null)
                    message.requiredBoolValue = Boolean(object.requiredBoolValue);
                if (object.requiredStringValue != null)
                    message.requiredStringValue = String(object.requiredStringValue);
                return message;
            };

            /**
             * Creates a plain object from a Primitives message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.hello.Primitives
             * @static
             * @param {testapi.hello.Primitives} message Primitives
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Primitives.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.requiredDoubleValue = 0;
                    object.requiredFloatValue = 0;
                    object.requiredInt32Value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.requiredInt64Value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requiredInt64Value = options.longs === String ? "0" : 0;
                    object.requiredUint32Value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.requiredUint64Value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requiredUint64Value = options.longs === String ? "0" : 0;
                    object.requiredSint32Value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.requiredSint64Value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requiredSint64Value = options.longs === String ? "0" : 0;
                    object.requiredFixed32Value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.requiredFixed64Value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requiredFixed64Value = options.longs === String ? "0" : 0;
                    object.requiredSfixed32Value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.requiredSfixed64Value = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requiredSfixed64Value = options.longs === String ? "0" : 0;
                    object.requiredBoolValue = false;
                    object.requiredStringValue = "";
                }
                if (message.requiredDoubleValue != null && message.hasOwnProperty("requiredDoubleValue"))
                    object.requiredDoubleValue = options.json && !isFinite(message.requiredDoubleValue) ? String(message.requiredDoubleValue) : message.requiredDoubleValue;
                if (message.requiredFloatValue != null && message.hasOwnProperty("requiredFloatValue"))
                    object.requiredFloatValue = options.json && !isFinite(message.requiredFloatValue) ? String(message.requiredFloatValue) : message.requiredFloatValue;
                if (message.requiredInt32Value != null && message.hasOwnProperty("requiredInt32Value"))
                    object.requiredInt32Value = message.requiredInt32Value;
                if (message.requiredInt64Value != null && message.hasOwnProperty("requiredInt64Value"))
                    if (typeof message.requiredInt64Value === "number")
                        object.requiredInt64Value = options.longs === String ? String(message.requiredInt64Value) : message.requiredInt64Value;
                    else
                        object.requiredInt64Value = options.longs === String ? $util.Long.prototype.toString.call(message.requiredInt64Value) : options.longs === Number ? new $util.LongBits(message.requiredInt64Value.low >>> 0, message.requiredInt64Value.high >>> 0).toNumber() : message.requiredInt64Value;
                if (message.requiredUint32Value != null && message.hasOwnProperty("requiredUint32Value"))
                    object.requiredUint32Value = message.requiredUint32Value;
                if (message.requiredUint64Value != null && message.hasOwnProperty("requiredUint64Value"))
                    if (typeof message.requiredUint64Value === "number")
                        object.requiredUint64Value = options.longs === String ? String(message.requiredUint64Value) : message.requiredUint64Value;
                    else
                        object.requiredUint64Value = options.longs === String ? $util.Long.prototype.toString.call(message.requiredUint64Value) : options.longs === Number ? new $util.LongBits(message.requiredUint64Value.low >>> 0, message.requiredUint64Value.high >>> 0).toNumber(true) : message.requiredUint64Value;
                if (message.requiredSint32Value != null && message.hasOwnProperty("requiredSint32Value"))
                    object.requiredSint32Value = message.requiredSint32Value;
                if (message.requiredSint64Value != null && message.hasOwnProperty("requiredSint64Value"))
                    if (typeof message.requiredSint64Value === "number")
                        object.requiredSint64Value = options.longs === String ? String(message.requiredSint64Value) : message.requiredSint64Value;
                    else
                        object.requiredSint64Value = options.longs === String ? $util.Long.prototype.toString.call(message.requiredSint64Value) : options.longs === Number ? new $util.LongBits(message.requiredSint64Value.low >>> 0, message.requiredSint64Value.high >>> 0).toNumber() : message.requiredSint64Value;
                if (message.requiredFixed32Value != null && message.hasOwnProperty("requiredFixed32Value"))
                    object.requiredFixed32Value = message.requiredFixed32Value;
                if (message.requiredFixed64Value != null && message.hasOwnProperty("requiredFixed64Value"))
                    if (typeof message.requiredFixed64Value === "number")
                        object.requiredFixed64Value = options.longs === String ? String(message.requiredFixed64Value) : message.requiredFixed64Value;
                    else
                        object.requiredFixed64Value = options.longs === String ? $util.Long.prototype.toString.call(message.requiredFixed64Value) : options.longs === Number ? new $util.LongBits(message.requiredFixed64Value.low >>> 0, message.requiredFixed64Value.high >>> 0).toNumber() : message.requiredFixed64Value;
                if (message.requiredSfixed32Value != null && message.hasOwnProperty("requiredSfixed32Value"))
                    object.requiredSfixed32Value = message.requiredSfixed32Value;
                if (message.requiredSfixed64Value != null && message.hasOwnProperty("requiredSfixed64Value"))
                    if (typeof message.requiredSfixed64Value === "number")
                        object.requiredSfixed64Value = options.longs === String ? String(message.requiredSfixed64Value) : message.requiredSfixed64Value;
                    else
                        object.requiredSfixed64Value = options.longs === String ? $util.Long.prototype.toString.call(message.requiredSfixed64Value) : options.longs === Number ? new $util.LongBits(message.requiredSfixed64Value.low >>> 0, message.requiredSfixed64Value.high >>> 0).toNumber() : message.requiredSfixed64Value;
                if (message.requiredBoolValue != null && message.hasOwnProperty("requiredBoolValue"))
                    object.requiredBoolValue = message.requiredBoolValue;
                if (message.requiredStringValue != null && message.hasOwnProperty("requiredStringValue"))
                    object.requiredStringValue = message.requiredStringValue;
                return object;
            };

            /**
             * Converts this Primitives to JSON.
             * @function toJSON
             * @memberof testapi.hello.Primitives
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Primitives.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Primitives;
        })();

        return hello;
    })();

    return testapi;
})();

module.exports = $root;
