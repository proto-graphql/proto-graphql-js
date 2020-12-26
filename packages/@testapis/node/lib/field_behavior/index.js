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

        deprecation.FieldBehaviorComentsMessage = (function() {

            /**
             * Properties of a FieldBehaviorComentsMessage.
             * @memberof testapi.deprecation
             * @interface IFieldBehaviorComentsMessage
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [requiredField] FieldBehaviorComentsMessage requiredField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [requiredOutputOnlyField] FieldBehaviorComentsMessage requiredOutputOnlyField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [outputOnlyRequiredField] FieldBehaviorComentsMessage outputOnlyRequiredField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [outputOnlyField] FieldBehaviorComentsMessage outputOnlyField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [requiredInputOnlyField] FieldBehaviorComentsMessage requiredInputOnlyField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [inputOnlyRequiredField] FieldBehaviorComentsMessage inputOnlyRequiredField
             * @property {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null} [inputOnlyField] FieldBehaviorComentsMessage inputOnlyField
             */

            /**
             * Constructs a new FieldBehaviorComentsMessage.
             * @memberof testapi.deprecation
             * @classdesc Represents a FieldBehaviorComentsMessage.
             * @implements IFieldBehaviorComentsMessage
             * @constructor
             * @param {testapi.deprecation.IFieldBehaviorComentsMessage=} [properties] Properties to set
             */
            function FieldBehaviorComentsMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FieldBehaviorComentsMessage requiredField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} requiredField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.requiredField = null;

            /**
             * FieldBehaviorComentsMessage requiredOutputOnlyField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} requiredOutputOnlyField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.requiredOutputOnlyField = null;

            /**
             * FieldBehaviorComentsMessage outputOnlyRequiredField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} outputOnlyRequiredField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.outputOnlyRequiredField = null;

            /**
             * FieldBehaviorComentsMessage outputOnlyField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} outputOnlyField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.outputOnlyField = null;

            /**
             * FieldBehaviorComentsMessage requiredInputOnlyField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} requiredInputOnlyField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.requiredInputOnlyField = null;

            /**
             * FieldBehaviorComentsMessage inputOnlyRequiredField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} inputOnlyRequiredField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.inputOnlyRequiredField = null;

            /**
             * FieldBehaviorComentsMessage inputOnlyField.
             * @member {testapi.deprecation.FieldBehaviorComentsMessage.IPost|null|undefined} inputOnlyField
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             */
            FieldBehaviorComentsMessage.prototype.inputOnlyField = null;

            /**
             * Creates a new FieldBehaviorComentsMessage instance using the specified properties.
             * @function create
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {testapi.deprecation.IFieldBehaviorComentsMessage=} [properties] Properties to set
             * @returns {testapi.deprecation.FieldBehaviorComentsMessage} FieldBehaviorComentsMessage instance
             */
            FieldBehaviorComentsMessage.create = function create(properties) {
                return new FieldBehaviorComentsMessage(properties);
            };

            /**
             * Encodes the specified FieldBehaviorComentsMessage message. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @function encode
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {testapi.deprecation.IFieldBehaviorComentsMessage} message FieldBehaviorComentsMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FieldBehaviorComentsMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.requiredField != null && Object.hasOwnProperty.call(message, "requiredField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.requiredField, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.requiredOutputOnlyField != null && Object.hasOwnProperty.call(message, "requiredOutputOnlyField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.requiredOutputOnlyField, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.outputOnlyRequiredField != null && Object.hasOwnProperty.call(message, "outputOnlyRequiredField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.outputOnlyRequiredField, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.outputOnlyField != null && Object.hasOwnProperty.call(message, "outputOnlyField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.outputOnlyField, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.requiredInputOnlyField != null && Object.hasOwnProperty.call(message, "requiredInputOnlyField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.requiredInputOnlyField, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.inputOnlyRequiredField != null && Object.hasOwnProperty.call(message, "inputOnlyRequiredField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.inputOnlyRequiredField, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.inputOnlyField != null && Object.hasOwnProperty.call(message, "inputOnlyField"))
                    $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.encode(message.inputOnlyField, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FieldBehaviorComentsMessage message, length delimited. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {testapi.deprecation.IFieldBehaviorComentsMessage} message FieldBehaviorComentsMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FieldBehaviorComentsMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer.
             * @function decode
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {testapi.deprecation.FieldBehaviorComentsMessage} FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FieldBehaviorComentsMessage.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.FieldBehaviorComentsMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.requiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.requiredOutputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.outputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.outputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 5:
                        message.requiredInputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 6:
                        message.inputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    case 7:
                        message.inputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a FieldBehaviorComentsMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {testapi.deprecation.FieldBehaviorComentsMessage} FieldBehaviorComentsMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FieldBehaviorComentsMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FieldBehaviorComentsMessage message.
             * @function verify
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FieldBehaviorComentsMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.requiredField != null && message.hasOwnProperty("requiredField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.requiredField);
                    if (error)
                        return "requiredField." + error;
                }
                if (message.requiredOutputOnlyField != null && message.hasOwnProperty("requiredOutputOnlyField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.requiredOutputOnlyField);
                    if (error)
                        return "requiredOutputOnlyField." + error;
                }
                if (message.outputOnlyRequiredField != null && message.hasOwnProperty("outputOnlyRequiredField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.outputOnlyRequiredField);
                    if (error)
                        return "outputOnlyRequiredField." + error;
                }
                if (message.outputOnlyField != null && message.hasOwnProperty("outputOnlyField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.outputOnlyField);
                    if (error)
                        return "outputOnlyField." + error;
                }
                if (message.requiredInputOnlyField != null && message.hasOwnProperty("requiredInputOnlyField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.requiredInputOnlyField);
                    if (error)
                        return "requiredInputOnlyField." + error;
                }
                if (message.inputOnlyRequiredField != null && message.hasOwnProperty("inputOnlyRequiredField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.inputOnlyRequiredField);
                    if (error)
                        return "inputOnlyRequiredField." + error;
                }
                if (message.inputOnlyField != null && message.hasOwnProperty("inputOnlyField")) {
                    var error = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.verify(message.inputOnlyField);
                    if (error)
                        return "inputOnlyField." + error;
                }
                return null;
            };

            /**
             * Creates a FieldBehaviorComentsMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {testapi.deprecation.FieldBehaviorComentsMessage} FieldBehaviorComentsMessage
             */
            FieldBehaviorComentsMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.testapi.deprecation.FieldBehaviorComentsMessage)
                    return object;
                var message = new $root.testapi.deprecation.FieldBehaviorComentsMessage();
                if (object.requiredField != null) {
                    if (typeof object.requiredField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.requiredField: object expected");
                    message.requiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.requiredField);
                }
                if (object.requiredOutputOnlyField != null) {
                    if (typeof object.requiredOutputOnlyField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.requiredOutputOnlyField: object expected");
                    message.requiredOutputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.requiredOutputOnlyField);
                }
                if (object.outputOnlyRequiredField != null) {
                    if (typeof object.outputOnlyRequiredField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.outputOnlyRequiredField: object expected");
                    message.outputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.outputOnlyRequiredField);
                }
                if (object.outputOnlyField != null) {
                    if (typeof object.outputOnlyField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.outputOnlyField: object expected");
                    message.outputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.outputOnlyField);
                }
                if (object.requiredInputOnlyField != null) {
                    if (typeof object.requiredInputOnlyField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.requiredInputOnlyField: object expected");
                    message.requiredInputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.requiredInputOnlyField);
                }
                if (object.inputOnlyRequiredField != null) {
                    if (typeof object.inputOnlyRequiredField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.inputOnlyRequiredField: object expected");
                    message.inputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.inputOnlyRequiredField);
                }
                if (object.inputOnlyField != null) {
                    if (typeof object.inputOnlyField !== "object")
                        throw TypeError(".testapi.deprecation.FieldBehaviorComentsMessage.inputOnlyField: object expected");
                    message.inputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.fromObject(object.inputOnlyField);
                }
                return message;
            };

            /**
             * Creates a plain object from a FieldBehaviorComentsMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @static
             * @param {testapi.deprecation.FieldBehaviorComentsMessage} message FieldBehaviorComentsMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FieldBehaviorComentsMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.requiredField = null;
                    object.requiredOutputOnlyField = null;
                    object.outputOnlyRequiredField = null;
                    object.outputOnlyField = null;
                    object.requiredInputOnlyField = null;
                    object.inputOnlyRequiredField = null;
                    object.inputOnlyField = null;
                }
                if (message.requiredField != null && message.hasOwnProperty("requiredField"))
                    object.requiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.requiredField, options);
                if (message.requiredOutputOnlyField != null && message.hasOwnProperty("requiredOutputOnlyField"))
                    object.requiredOutputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.requiredOutputOnlyField, options);
                if (message.outputOnlyRequiredField != null && message.hasOwnProperty("outputOnlyRequiredField"))
                    object.outputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.outputOnlyRequiredField, options);
                if (message.outputOnlyField != null && message.hasOwnProperty("outputOnlyField"))
                    object.outputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.outputOnlyField, options);
                if (message.requiredInputOnlyField != null && message.hasOwnProperty("requiredInputOnlyField"))
                    object.requiredInputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.requiredInputOnlyField, options);
                if (message.inputOnlyRequiredField != null && message.hasOwnProperty("inputOnlyRequiredField"))
                    object.inputOnlyRequiredField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.inputOnlyRequiredField, options);
                if (message.inputOnlyField != null && message.hasOwnProperty("inputOnlyField"))
                    object.inputOnlyField = $root.testapi.deprecation.FieldBehaviorComentsMessage.Post.toObject(message.inputOnlyField, options);
                return object;
            };

            /**
             * Converts this FieldBehaviorComentsMessage to JSON.
             * @function toJSON
             * @memberof testapi.deprecation.FieldBehaviorComentsMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FieldBehaviorComentsMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            FieldBehaviorComentsMessage.Post = (function() {

                /**
                 * Properties of a Post.
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage
                 * @interface IPost
                 * @property {string|null} [body] Post body
                 */

                /**
                 * Constructs a new Post.
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage
                 * @classdesc Represents a Post.
                 * @implements IPost
                 * @constructor
                 * @param {testapi.deprecation.FieldBehaviorComentsMessage.IPost=} [properties] Properties to set
                 */
                function Post(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Post body.
                 * @member {string} body
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @instance
                 */
                Post.prototype.body = "";

                /**
                 * Creates a new Post instance using the specified properties.
                 * @function create
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {testapi.deprecation.FieldBehaviorComentsMessage.IPost=} [properties] Properties to set
                 * @returns {testapi.deprecation.FieldBehaviorComentsMessage.Post} Post instance
                 */
                Post.create = function create(properties) {
                    return new Post(properties);
                };

                /**
                 * Encodes the specified Post message. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @function encode
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {testapi.deprecation.FieldBehaviorComentsMessage.IPost} message Post message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Post.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.body);
                    return writer;
                };

                /**
                 * Encodes the specified Post message, length delimited. Does not implicitly {@link testapi.deprecation.FieldBehaviorComentsMessage.Post.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {testapi.deprecation.FieldBehaviorComentsMessage.IPost} message Post message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Post.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Post message from the specified reader or buffer.
                 * @function decode
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {testapi.deprecation.FieldBehaviorComentsMessage.Post} Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Post.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.testapi.deprecation.FieldBehaviorComentsMessage.Post();
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
                 * Decodes a Post message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {testapi.deprecation.FieldBehaviorComentsMessage.Post} Post
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Post.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Post message.
                 * @function verify
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Post.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.body != null && message.hasOwnProperty("body"))
                        if (!$util.isString(message.body))
                            return "body: string expected";
                    return null;
                };

                /**
                 * Creates a Post message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {testapi.deprecation.FieldBehaviorComentsMessage.Post} Post
                 */
                Post.fromObject = function fromObject(object) {
                    if (object instanceof $root.testapi.deprecation.FieldBehaviorComentsMessage.Post)
                        return object;
                    var message = new $root.testapi.deprecation.FieldBehaviorComentsMessage.Post();
                    if (object.body != null)
                        message.body = String(object.body);
                    return message;
                };

                /**
                 * Creates a plain object from a Post message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @static
                 * @param {testapi.deprecation.FieldBehaviorComentsMessage.Post} message Post
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Post.toObject = function toObject(message, options) {
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
                 * Converts this Post to JSON.
                 * @function toJSON
                 * @memberof testapi.deprecation.FieldBehaviorComentsMessage.Post
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Post.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Post;
            })();

            return FieldBehaviorComentsMessage;
        })();

        return deprecation;
    })();

    return testapi;
})();

module.exports = $root;
