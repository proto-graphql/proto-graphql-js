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

    testapi.oneof = (function() {

        /**
         * Namespace oneof.
         * @memberof testapi
         * @namespace
         */
        var oneof = {};

        oneof.OneofParent = (function() {

            /**
             * Properties of an OneofParent.
             * @memberof testapi.oneof
             * @interface IOneofParent
             * @property {string|null} [normalField] OneofParent normalField
             * @property {testapi.oneof.IOneofMemberMessage1|null} [requiredMessage1] OneofParent requiredMessage1
             * @property {testapi.oneof.IOneofMemberMessage2|null} [requiredMessage2] OneofParent requiredMessage2
             * @property {testapi.oneof.IOneofMemberMessage1|null} [optoinalMessage1] OneofParent optoinalMessage1
             * @property {testapi.oneof.IOneofMemberMessage2|null} [optoinalMessage2] OneofParent optoinalMessage2
             */

            /**
             * Constructs a new OneofParent.
             * @memberof testapi.oneof
             * @classdesc Represents an OneofParent.
             * @implements IOneofParent
             * @constructor
             * @param {testapi.oneof.IOneofParent=} [properties] Properties to set
             */
            function OneofParent(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OneofParent normalField.
             * @member {string} normalField
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            OneofParent.prototype.normalField = "";

            /**
             * OneofParent requiredMessage1.
             * @member {testapi.oneof.IOneofMemberMessage1|null|undefined} requiredMessage1
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            OneofParent.prototype.requiredMessage1 = null;

            /**
             * OneofParent requiredMessage2.
             * @member {testapi.oneof.IOneofMemberMessage2|null|undefined} requiredMessage2
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            OneofParent.prototype.requiredMessage2 = null;

            /**
             * OneofParent optoinalMessage1.
             * @member {testapi.oneof.IOneofMemberMessage1|null|undefined} optoinalMessage1
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            OneofParent.prototype.optoinalMessage1 = null;

            /**
             * OneofParent optoinalMessage2.
             * @member {testapi.oneof.IOneofMemberMessage2|null|undefined} optoinalMessage2
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            OneofParent.prototype.optoinalMessage2 = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * OneofParent requiredOneofMembers.
             * @member {"requiredMessage1"|"requiredMessage2"|undefined} requiredOneofMembers
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            Object.defineProperty(OneofParent.prototype, "requiredOneofMembers", {
                get: $util.oneOfGetter($oneOfFields = ["requiredMessage1", "requiredMessage2"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * OneofParent optionalOneofMembers.
             * @member {"optoinalMessage1"|"optoinalMessage2"|undefined} optionalOneofMembers
             * @memberof testapi.oneof.OneofParent
             * @instance
             */
            Object.defineProperty(OneofParent.prototype, "optionalOneofMembers", {
                get: $util.oneOfGetter($oneOfFields = ["optoinalMessage1", "optoinalMessage2"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new OneofParent instance using the specified properties.
             * @function create
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {testapi.oneof.IOneofParent=} [properties] Properties to set
             * @returns {testapi.oneof.OneofParent} OneofParent instance
             */
            OneofParent.create = function create(properties) {
                return new OneofParent(properties);
            };

            /**
             * Encodes the specified OneofParent message. Does not implicitly {@link testapi.oneof.OneofParent.verify|verify} messages.
             * @function encode
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {testapi.oneof.IOneofParent} message OneofParent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofParent.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.normalField != null && Object.hasOwnProperty.call(message, "normalField"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.normalField);
                if (message.requiredMessage1 != null && Object.hasOwnProperty.call(message, "requiredMessage1"))
                    $root.testapi.oneof.OneofMemberMessage1.encode(message.requiredMessage1, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.requiredMessage2 != null && Object.hasOwnProperty.call(message, "requiredMessage2"))
                    $root.testapi.oneof.OneofMemberMessage2.encode(message.requiredMessage2, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.optoinalMessage1 != null && Object.hasOwnProperty.call(message, "optoinalMessage1"))
                    $root.testapi.oneof.OneofMemberMessage1.encode(message.optoinalMessage1, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.optoinalMessage2 != null && Object.hasOwnProperty.call(message, "optoinalMessage2"))
                    $root.testapi.oneof.OneofMemberMessage2.encode(message.optoinalMessage2, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified OneofParent message, length delimited. Does not implicitly {@link testapi.oneof.OneofParent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {testapi.oneof.IOneofParent} message OneofParent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofParent.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OneofParent message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.oneof.OneofParent} OneofParent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofParent.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.oneof.OneofParent();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.normalField = reader.string();
                        break;
                    case 2:
                        message.requiredMessage1 = $root.testapi.oneof.OneofMemberMessage1.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.requiredMessage2 = $root.testapi.oneof.OneofMemberMessage2.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.optoinalMessage1 = $root.testapi.oneof.OneofMemberMessage1.decode(reader, reader.uint32());
                        break;
                    case 5:
                        message.optoinalMessage2 = $root.testapi.oneof.OneofMemberMessage2.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OneofParent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.oneof.OneofParent} OneofParent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofParent.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OneofParent message.
             * @function verify
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OneofParent.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.normalField != null && message.hasOwnProperty("normalField"))
                    if (!$util.isString(message.normalField))
                        return "normalField: string expected";
                if (message.requiredMessage1 != null && message.hasOwnProperty("requiredMessage1")) {
                    properties.requiredOneofMembers = 1;
                    {
                        var error = $root.testapi.oneof.OneofMemberMessage1.verify(message.requiredMessage1);
                        if (error)
                            return "requiredMessage1." + error;
                    }
                }
                if (message.requiredMessage2 != null && message.hasOwnProperty("requiredMessage2")) {
                    if (properties.requiredOneofMembers === 1)
                        return "requiredOneofMembers: multiple values";
                    properties.requiredOneofMembers = 1;
                    {
                        var error = $root.testapi.oneof.OneofMemberMessage2.verify(message.requiredMessage2);
                        if (error)
                            return "requiredMessage2." + error;
                    }
                }
                if (message.optoinalMessage1 != null && message.hasOwnProperty("optoinalMessage1")) {
                    properties.optionalOneofMembers = 1;
                    {
                        var error = $root.testapi.oneof.OneofMemberMessage1.verify(message.optoinalMessage1);
                        if (error)
                            return "optoinalMessage1." + error;
                    }
                }
                if (message.optoinalMessage2 != null && message.hasOwnProperty("optoinalMessage2")) {
                    if (properties.optionalOneofMembers === 1)
                        return "optionalOneofMembers: multiple values";
                    properties.optionalOneofMembers = 1;
                    {
                        var error = $root.testapi.oneof.OneofMemberMessage2.verify(message.optoinalMessage2);
                        if (error)
                            return "optoinalMessage2." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an OneofParent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.oneof.OneofParent} OneofParent
             */
            OneofParent.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.oneof.OneofParent)
                    return object;
                var message = new $root.testapi.oneof.OneofParent();
                if (object.normalField != null)
                    message.normalField = String(object.normalField);
                if (object.requiredMessage1 != null) {
                    if (typeof object.requiredMessage1 !== "object")
                        throw TypeError(".testapi.oneof.OneofParent.requiredMessage1: object expected");
                    message.requiredMessage1 = $root.testapi.oneof.OneofMemberMessage1.fromObject(object.requiredMessage1);
                }
                if (object.requiredMessage2 != null) {
                    if (typeof object.requiredMessage2 !== "object")
                        throw TypeError(".testapi.oneof.OneofParent.requiredMessage2: object expected");
                    message.requiredMessage2 = $root.testapi.oneof.OneofMemberMessage2.fromObject(object.requiredMessage2);
                }
                if (object.optoinalMessage1 != null) {
                    if (typeof object.optoinalMessage1 !== "object")
                        throw TypeError(".testapi.oneof.OneofParent.optoinalMessage1: object expected");
                    message.optoinalMessage1 = $root.testapi.oneof.OneofMemberMessage1.fromObject(object.optoinalMessage1);
                }
                if (object.optoinalMessage2 != null) {
                    if (typeof object.optoinalMessage2 !== "object")
                        throw TypeError(".testapi.oneof.OneofParent.optoinalMessage2: object expected");
                    message.optoinalMessage2 = $root.testapi.oneof.OneofMemberMessage2.fromObject(object.optoinalMessage2);
                }
                return message;
            };

            /**
             * Creates a plain object from an OneofParent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.oneof.OneofParent
             * @static
             * @param {testapi.oneof.OneofParent} message OneofParent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OneofParent.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.normalField = "";
                if (message.normalField != null && message.hasOwnProperty("normalField"))
                    object.normalField = message.normalField;
                if (message.requiredMessage1 != null && message.hasOwnProperty("requiredMessage1")) {
                    object.requiredMessage1 = $root.testapi.oneof.OneofMemberMessage1.toObject(message.requiredMessage1, options);
                    if (options.oneofs)
                        object.requiredOneofMembers = "requiredMessage1";
                }
                if (message.requiredMessage2 != null && message.hasOwnProperty("requiredMessage2")) {
                    object.requiredMessage2 = $root.testapi.oneof.OneofMemberMessage2.toObject(message.requiredMessage2, options);
                    if (options.oneofs)
                        object.requiredOneofMembers = "requiredMessage2";
                }
                if (message.optoinalMessage1 != null && message.hasOwnProperty("optoinalMessage1")) {
                    object.optoinalMessage1 = $root.testapi.oneof.OneofMemberMessage1.toObject(message.optoinalMessage1, options);
                    if (options.oneofs)
                        object.optionalOneofMembers = "optoinalMessage1";
                }
                if (message.optoinalMessage2 != null && message.hasOwnProperty("optoinalMessage2")) {
                    object.optoinalMessage2 = $root.testapi.oneof.OneofMemberMessage2.toObject(message.optoinalMessage2, options);
                    if (options.oneofs)
                        object.optionalOneofMembers = "optoinalMessage2";
                }
                return object;
            };

            /**
             * Converts this OneofParent to JSON.
             * @function toJSON
             * @memberof testapi.oneof.OneofParent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OneofParent.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return OneofParent;
        })();

        oneof.OneofMemberMessage1 = (function() {

            /**
             * Properties of an OneofMemberMessage1.
             * @memberof testapi.oneof
             * @interface IOneofMemberMessage1
             * @property {string|null} [body] OneofMemberMessage1 body
             */

            /**
             * Constructs a new OneofMemberMessage1.
             * @memberof testapi.oneof
             * @classdesc Represents an OneofMemberMessage1.
             * @implements IOneofMemberMessage1
             * @constructor
             * @param {testapi.oneof.IOneofMemberMessage1=} [properties] Properties to set
             */
            function OneofMemberMessage1(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OneofMemberMessage1 body.
             * @member {string} body
             * @memberof testapi.oneof.OneofMemberMessage1
             * @instance
             */
            OneofMemberMessage1.prototype.body = "";

            /**
             * Creates a new OneofMemberMessage1 instance using the specified properties.
             * @function create
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {testapi.oneof.IOneofMemberMessage1=} [properties] Properties to set
             * @returns {testapi.oneof.OneofMemberMessage1} OneofMemberMessage1 instance
             */
            OneofMemberMessage1.create = function create(properties) {
                return new OneofMemberMessage1(properties);
            };

            /**
             * Encodes the specified OneofMemberMessage1 message. Does not implicitly {@link testapi.oneof.OneofMemberMessage1.verify|verify} messages.
             * @function encode
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {testapi.oneof.IOneofMemberMessage1} message OneofMemberMessage1 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofMemberMessage1.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                return writer;
            };

            /**
             * Encodes the specified OneofMemberMessage1 message, length delimited. Does not implicitly {@link testapi.oneof.OneofMemberMessage1.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {testapi.oneof.IOneofMemberMessage1} message OneofMemberMessage1 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofMemberMessage1.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OneofMemberMessage1 message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.oneof.OneofMemberMessage1} OneofMemberMessage1
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofMemberMessage1.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.oneof.OneofMemberMessage1();
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
             * Decodes an OneofMemberMessage1 message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.oneof.OneofMemberMessage1} OneofMemberMessage1
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofMemberMessage1.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OneofMemberMessage1 message.
             * @function verify
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OneofMemberMessage1.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!$util.isString(message.body))
                        return "body: string expected";
                return null;
            };

            /**
             * Creates an OneofMemberMessage1 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.oneof.OneofMemberMessage1} OneofMemberMessage1
             */
            OneofMemberMessage1.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.oneof.OneofMemberMessage1)
                    return object;
                var message = new $root.testapi.oneof.OneofMemberMessage1();
                if (object.body != null)
                    message.body = String(object.body);
                return message;
            };

            /**
             * Creates a plain object from an OneofMemberMessage1 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.oneof.OneofMemberMessage1
             * @static
             * @param {testapi.oneof.OneofMemberMessage1} message OneofMemberMessage1
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OneofMemberMessage1.toObject = function toObject(message, options) {
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
             * Converts this OneofMemberMessage1 to JSON.
             * @function toJSON
             * @memberof testapi.oneof.OneofMemberMessage1
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OneofMemberMessage1.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return OneofMemberMessage1;
        })();

        oneof.OneofMemberMessage2 = (function() {

            /**
             * Properties of an OneofMemberMessage2.
             * @memberof testapi.oneof
             * @interface IOneofMemberMessage2
             * @property {string|null} [imageUrl] OneofMemberMessage2 imageUrl
             */

            /**
             * Constructs a new OneofMemberMessage2.
             * @memberof testapi.oneof
             * @classdesc Represents an OneofMemberMessage2.
             * @implements IOneofMemberMessage2
             * @constructor
             * @param {testapi.oneof.IOneofMemberMessage2=} [properties] Properties to set
             */
            function OneofMemberMessage2(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OneofMemberMessage2 imageUrl.
             * @member {string} imageUrl
             * @memberof testapi.oneof.OneofMemberMessage2
             * @instance
             */
            OneofMemberMessage2.prototype.imageUrl = "";

            /**
             * Creates a new OneofMemberMessage2 instance using the specified properties.
             * @function create
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {testapi.oneof.IOneofMemberMessage2=} [properties] Properties to set
             * @returns {testapi.oneof.OneofMemberMessage2} OneofMemberMessage2 instance
             */
            OneofMemberMessage2.create = function create(properties) {
                return new OneofMemberMessage2(properties);
            };

            /**
             * Encodes the specified OneofMemberMessage2 message. Does not implicitly {@link testapi.oneof.OneofMemberMessage2.verify|verify} messages.
             * @function encode
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {testapi.oneof.IOneofMemberMessage2} message OneofMemberMessage2 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofMemberMessage2.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.imageUrl != null && Object.hasOwnProperty.call(message, "imageUrl"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.imageUrl);
                return writer;
            };

            /**
             * Encodes the specified OneofMemberMessage2 message, length delimited. Does not implicitly {@link testapi.oneof.OneofMemberMessage2.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {testapi.oneof.IOneofMemberMessage2} message OneofMemberMessage2 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OneofMemberMessage2.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OneofMemberMessage2 message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.oneof.OneofMemberMessage2} OneofMemberMessage2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofMemberMessage2.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.oneof.OneofMemberMessage2();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.imageUrl = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OneofMemberMessage2 message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.oneof.OneofMemberMessage2} OneofMemberMessage2
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OneofMemberMessage2.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OneofMemberMessage2 message.
             * @function verify
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OneofMemberMessage2.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                    if (!$util.isString(message.imageUrl))
                        return "imageUrl: string expected";
                return null;
            };

            /**
             * Creates an OneofMemberMessage2 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.oneof.OneofMemberMessage2} OneofMemberMessage2
             */
            OneofMemberMessage2.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.oneof.OneofMemberMessage2)
                    return object;
                var message = new $root.testapi.oneof.OneofMemberMessage2();
                if (object.imageUrl != null)
                    message.imageUrl = String(object.imageUrl);
                return message;
            };

            /**
             * Creates a plain object from an OneofMemberMessage2 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.oneof.OneofMemberMessage2
             * @static
             * @param {testapi.oneof.OneofMemberMessage2} message OneofMemberMessage2
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OneofMemberMessage2.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.imageUrl = "";
                if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                    object.imageUrl = message.imageUrl;
                return object;
            };

            /**
             * Converts this OneofMemberMessage2 to JSON.
             * @function toJSON
             * @memberof testapi.oneof.OneofMemberMessage2
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OneofMemberMessage2.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return OneofMemberMessage2;
        })();

        return oneof;
    })();

    return testapi;
})();

module.exports = $root;
