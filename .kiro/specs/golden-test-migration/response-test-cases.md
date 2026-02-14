# レスポンス検証対象ケース一覧

## 目的

旧 e2e テストで GraphQL クエリのレスポンス検証を行っていたケースを列挙し、Golden Test への移植対象を明確化する。

## 対象範囲

- 対象ケース数: **29件**
- runtime 内訳: ts-proto 13件, ts-proto-forcelong 2件, protobuf-es-v1 14件
- 非対象: 旧 e2e でレスポンス検証を持たなかったケース

## ケース一覧

| No | 旧 e2e ケース | Golden ケース | 主検証観点 |
|---:|---|---|---|
| 1 | `pothos--deprecation--protobuf-es-v1` | `protobuf-es-v1/testapis.deprecation` | deprecated 型のレスポンス整合 |
| 2 | `pothos--edgecases-import_from_same_pkg--protobuf-es-v1` | `protobuf-es-v1/testapis.edgecases.import_from_same_pkg` | レスポンスのフィールド値マッピング |
| 3 | `pothos--edgecases-import_oneof_member_from_other_file--protobuf-es-v1` | `protobuf-es-v1/testapis.edgecases.import_oneof_member_from_other_file` | 不正クエリ時の GraphQL エラー |
| 4 | `pothos--edgecases-import_squashed_union--protobuf-es-v1` | `protobuf-es-v1/testapis.edgecases.import_squashed_union` | レスポンスのフィールド値マッピング |
| 5 | `pothos--empty_types--protobuf-es-v1` | `protobuf-es-v1/testapis.empty_types` | レスポンスのフィールド値マッピング |
| 6 | `pothos--enums--protobuf-es-v1` | `protobuf-es-v1/testapis.enums` | レスポンスのフィールド値マッピング |
| 7 | `pothos--extensions--protobuf-es-v1` | `protobuf-es-v1/testapis.extensions` | レスポンスのフィールド値マッピング |
| 8 | `pothos--field_behavior--protobuf-es-v1` | `protobuf-es-v1/testapis.field_behavior` | レスポンスのフィールド値マッピング |
| 9 | `pothos--multipkgs--protobuf-es-v1` | `protobuf-es-v1/testapis.multipkgs` | レスポンスのフィールド値マッピング |
| 10 | `pothos--nested--protobuf-es-v1` | `protobuf-es-v1/testapis.nested` | レスポンスのフィールド値マッピング |
| 11 | `pothos--oneof--protobuf-es-v1` | `protobuf-es-v1/testapis.oneof` | union/oneof の解決 |
| 12 | `pothos--primitives--protobuf-es-v1` | `protobuf-es-v1/testapis.primitives` | プリミティブ型・スカラー変換 |
| 13 | `pothos--proto3_optional--protobuf-es-v1` | `protobuf-es-v1/testapis.proto3_optional` | レスポンスのフィールド値マッピング |
| 14 | `pothos--wktypes--protobuf-es-v1` | `protobuf-es-v1/testapis.wktypes` | Well-Known Types の変換 |
| 15 | `pothos--primitives--ts-proto-with-forcelong-number` | `ts-proto-forcelong/testapis.primitives` | プリミティブ型・スカラー変換 |
| 16 | `pothos--wktypes--ts-proto-with-forcelong-number` | `ts-proto-forcelong/testapis.wktypes` | Well-Known Types の変換 |
| 17 | `pothos--deprecation--ts-proto` | `ts-proto/testapis.deprecation` | deprecated 型のレスポンス整合 |
| 18 | `pothos--edgecases-import_from_same_pkg--ts-proto` | `ts-proto/testapis.edgecases.import_from_same_pkg` | レスポンスのフィールド値マッピング |
| 19 | `pothos--edgecases-import_squashed_union--ts-proto` | `ts-proto/testapis.edgecases.import_squashed_union` | レスポンスのフィールド値マッピング |
| 20 | `pothos--empty_types--ts-proto` | `ts-proto/testapis.empty_types` | レスポンスのフィールド値マッピング |
| 21 | `pothos--enums--ts-proto` | `ts-proto/testapis.enums` | レスポンスのフィールド値マッピング |
| 22 | `pothos--extensions--ts-proto` | `ts-proto/testapis.extensions` | レスポンスのフィールド値マッピング |
| 23 | `pothos--field_behavior--ts-proto` | `ts-proto/testapis.field_behavior` | レスポンスのフィールド値マッピング |
| 24 | `pothos--multipkgs--ts-proto` | `ts-proto/testapis.multipkgs` | レスポンスのフィールド値マッピング |
| 25 | `pothos--nested--ts-proto` | `ts-proto/testapis.nested` | レスポンスのフィールド値マッピング |
| 26 | `pothos--oneof--ts-proto` | `ts-proto/testapis.oneof` | union/oneof の解決 |
| 27 | `pothos--primitives--ts-proto` | `ts-proto/testapis.primitives` | プリミティブ型・スカラー変換 |
| 28 | `pothos--proto3_optional--ts-proto` | `ts-proto/testapis.proto3_optional` | レスポンスのフィールド値マッピング |
| 29 | `pothos--wktypes--ts-proto` | `ts-proto/testapis.wktypes` | Well-Known Types の変換 |

## ケース詳細

### protobuf-es-v1/testapis.deprecation

- 旧ファイル: `e2e/tests/pothos--deprecation--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.deprecation`
- 主検証観点: deprecated 型のレスポンス整合

#### クエリ

```graphql
      query Test {
        test1 {
          body
        }
        test2 {
          body
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test1": {
          "body": "hello",
        },
        "test2": {
          "body": "world",
        },
      },
    }
  
```

### protobuf-es-v1/testapis.edgecases.import_from_same_pkg

- 旧ファイル: `e2e/tests/pothos--edgecases-import_from_same_pkg--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.edgecases.import_from_same_pkg`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          child {
            body
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "child": {
            "body": "hello",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.edgecases.import_oneof_member_from_other_file

- 旧ファイル: `e2e/tests/pothos--edgecases-import_oneof_member_from_other_file--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.edgecases.import_oneof_member_from_other_file`
- 主検証観点: 不正クエリ時の GraphQL エラー

#### クエリ

```graphql
      query Test {
        test {
          ... on OneofMember1 {
            title
          }
          ... on OneofMember1 {
            count
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "errors": [
        [GraphQLError: Fragment cannot be spread here as objects of type "OneofParent" can never be of type "OneofMember1".],
        [GraphQLError: Cannot query field "title" on type "OneofMember1".],
        [GraphQLError: Fragment cannot be spread here as objects of type "OneofParent" can never be of type "OneofMember1".],
        [GraphQLError: Cannot query field "count" on type "OneofMember1".],
      ],
    }
  
```

### protobuf-es-v1/testapis.edgecases.import_squashed_union

- 旧ファイル: `e2e/tests/pothos--edgecases-import_squashed_union--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.edgecases.import_squashed_union`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          msg {
            ... on OneofMessage1 {
              __typename
              body
            }
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "msg": {
            "__typename": "OneofMessage1",
            "body": "hello",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.empty_types

- 旧ファイル: `e2e/tests/pothos--empty_types--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.empty_types`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          _
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "_": true,
        },
      },
    }
  
```

### protobuf-es-v1/testapis.enums

- 旧ファイル: `e2e/tests/pothos--enums--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.enums`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          ...Message
        }
      }
      fragment Message on MessageWithEnums {
        requiredMyEnum
        requiredMyEnumWithoutUnspecified
        optionalMyEnum
        optionalMyEnumWithoutUnspecified
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalMyEnum": null,
          "optionalMyEnumWithoutUnspecified": "FOO",
          "requiredMyEnum": "BAR",
          "requiredMyEnumWithoutUnspecified": "FOO",
        },
      },
    }
  
```

### protobuf-es-v1/testapis.extensions

- 旧ファイル: `e2e/tests/pothos--extensions--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.extensions`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        testSquashedUnion {
          squashedMessage {
            ... on TestPrefixPrefixedMessageInnerMessage {
              ...Inner
            }
            ... on TestPrefixPrefixedMessageInnerMessage2 {
              ...Inner2
            }
          }
        }
      }
      fragment Inner on TestPrefixPrefixedMessageInnerMessage {
        body
      }
      fragment Inner2 on TestPrefixPrefixedMessageInnerMessage2 {
        body
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "testSquashedUnion": {
          "squashedMessage": {
            "body": "field 2",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.field_behavior

- 旧ファイル: `e2e/tests/pothos--field_behavior--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.field_behavior`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          requiredField {
            body
          }
          outputOnlyField {
            body
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "outputOnlyField": null,
          "requiredField": {
            "body": "hello",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.multipkgs

- 旧ファイル: `e2e/tests/pothos--multipkgs--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.multipkgs`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          message {
            body
          }
          enum
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "enum": "BAR",
          "message": {
            "body": "hello",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.nested

- 旧ファイル: `e2e/tests/pothos--nested--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.nested`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          body
          nested {
            nestedBody
          }
          nestedEnum
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "body": "hello",
          "nested": {
            "nestedBody": "world",
          },
          "nestedEnum": "BAR",
        },
      },
    }
  
```

### protobuf-es-v1/testapis.oneof

- 旧ファイル: `e2e/tests/pothos--oneof--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.oneof`
- 主検証観点: union/oneof の解決

#### クエリ

```graphql
      query Test {
        test {
          requiredOneofMembers {
            ... on OneofMemberMessage1 {
              body
            }
            ... on OneofMemberMessage2 {
              imageUrl
            }
          }
          optionalOneofMembers {
            ... on OneofMemberMessage1 {
              body
            }
            ... on OneofMemberMessage2 {
              imageUrl
            }
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalOneofMembers": null,
          "requiredOneofMembers": {
            "body": "hello",
          },
        },
      },
    }
  
```

### protobuf-es-v1/testapis.primitives

- 旧ファイル: `e2e/tests/pothos--primitives--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.primitives`
- 主検証観点: プリミティブ型・スカラー変換

#### クエリ

```graphql
      query Test {
        test {
          requiredPrimitives {
            ...Primitives
          }
          optionalPrimitives {
            ...Primitives
          }
          requiredPrimitivesList {
            ...Primitives
          }
          optionalPrimitivesList {
            ...Primitives
          }
        }
      }
      fragment Primitives on Primitives {
        requiredDoubleValue
        requiredFloatValue
        requiredInt32Value
        requiredInt64Value
        requiredUint32Value
        requiredUint64Value
        requiredSint32Value
        requiredSint64Value
        requiredFixed32Value
        requiredFixed64Value
        requiredSfixed32Value
        requiredSfixed64Value
        requiredBoolValue
        requiredStringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalPrimitives": null,
          "optionalPrimitivesList": [],
          "requiredPrimitives": {
            "requiredBoolValue": true,
            "requiredDoubleValue": 2.4,
            "requiredFixed32Value": 9,
            "requiredFixed64Value": 10,
            "requiredFloatValue": 3.5,
            "requiredInt32Value": 2,
            "requiredInt64Value": 4,
            "requiredSfixed32Value": 11,
            "requiredSfixed64Value": 12,
            "requiredSint32Value": 7,
            "requiredSint64Value": 8,
            "requiredStringValue": "foobar",
            "requiredUint32Value": 5,
            "requiredUint64Value": 6,
          },
          "requiredPrimitivesList": [],
        },
      },
    }
  
```

### protobuf-es-v1/testapis.proto3_optional

- 旧ファイル: `e2e/tests/pothos--proto3_optional--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.proto3_optional`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        valuesArePresent {
          ...Message
        }
      }
      fragment Message on Message {
        requiredStringValue
        optionalStringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "valuesArePresent": {
          "optionalStringValue": "optional field",
          "requiredStringValue": "required field",
        },
      },
    }
  
```

### protobuf-es-v1/testapis.wktypes

- 旧ファイル: `e2e/tests/pothos--wktypes--protobuf-es-v1/schema.test.ts`
- Golden ディレクトリ: `tests/golden/protobuf-es-v1/testapis.wktypes`
- 主検証観点: Well-Known Types の変換

#### クエリ

```graphql
      query Test {
        valuesArePresent {
          ...Message
        }
      }
      fragment Message on Message {
        timestamp
        int32Value
        int64Value
        uint32Value
        uint64Value
        floatValue
        doubleValue
        boolValue
        stringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "valuesArePresent": {
          "boolValue": true,
          "doubleValue": 2.4,
          "floatValue": 3.5,
          "int32Value": 2,
          "int64Value": 4,
          "stringValue": "foobar",
          "timestamp": 2020-12-28T06:42:05.453Z,
          "uint32Value": 5,
          "uint64Value": 6,
        },
      },
    }
  
```

### ts-proto-forcelong/testapis.primitives

- 旧ファイル: `e2e/tests/pothos--primitives--ts-proto-with-forcelong-number/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto-forcelong/testapis.primitives`
- 主検証観点: プリミティブ型・スカラー変換

#### クエリ

```graphql
      query Test {
        test {
          requiredPrimitives {
            ...Primitives
          }
          optionalPrimitives {
            ...Primitives
          }
          requiredPrimitivesList {
            ...Primitives
          }
          optionalPrimitivesList {
            ...Primitives
          }
        }
      }
      fragment Primitives on Primitives {
        requiredDoubleValue
        requiredFloatValue
        requiredInt32Value
        requiredInt64Value
        requiredUint32Value
        requiredUint64Value
        requiredSint32Value
        requiredSint64Value
        requiredFixed32Value
        requiredFixed64Value
        requiredSfixed32Value
        requiredSfixed64Value
        requiredBoolValue
        requiredStringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalPrimitives": null,
          "optionalPrimitivesList": [],
          "requiredPrimitives": {
            "requiredBoolValue": true,
            "requiredDoubleValue": 2.4,
            "requiredFixed32Value": 9,
            "requiredFixed64Value": 10,
            "requiredFloatValue": 3.5,
            "requiredInt32Value": 2,
            "requiredInt64Value": 4,
            "requiredSfixed32Value": 11,
            "requiredSfixed64Value": 12,
            "requiredSint32Value": 7,
            "requiredSint64Value": 8,
            "requiredStringValue": "foobar",
            "requiredUint32Value": 5,
            "requiredUint64Value": 6,
          },
          "requiredPrimitivesList": [],
        },
      },
    }
  
```

### ts-proto-forcelong/testapis.wktypes

- 旧ファイル: `e2e/tests/pothos--wktypes--ts-proto-with-forcelong-number/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto-forcelong/testapis.wktypes`
- 主検証観点: Well-Known Types の変換

#### クエリ

```graphql
      query Test {
        test {
          ...Message
        }
      }
      fragment Message on Message {
        timestamp
        int32Value
        int64Value
        uint32Value
        uint64Value
        floatValue
        doubleValue
        boolValue
        stringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "boolValue": true,
          "doubleValue": 2.4,
          "floatValue": 3.5,
          "int32Value": 2,
          "int64Value": 4,
          "stringValue": "foobar",
          "timestamp": 2020-12-28T06:42:05.453Z,
          "uint32Value": 5,
          "uint64Value": 6,
        },
      },
    }
  
```

### ts-proto/testapis.deprecation

- 旧ファイル: `e2e/tests/pothos--deprecation--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.deprecation`
- 主検証観点: deprecated 型のレスポンス整合

#### クエリ

```graphql
      query Test {
        test1 {
          body
        }
        test2 {
          body
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test1": {
          "body": "hello",
        },
        "test2": {
          "body": "world",
        },
      },
    }
  
```

### ts-proto/testapis.edgecases.import_from_same_pkg

- 旧ファイル: `e2e/tests/pothos--edgecases-import_from_same_pkg--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.edgecases.import_from_same_pkg`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          child {
            body
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "child": {
            "body": "hello",
          },
        },
      },
    }
  
```

### ts-proto/testapis.edgecases.import_squashed_union

- 旧ファイル: `e2e/tests/pothos--edgecases-import_squashed_union--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.edgecases.import_squashed_union`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          msg {
            ... on OneofMessage1 {
              __typename
              body
            }
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "msg": {
            "__typename": "OneofMessage1",
            "body": "hello",
          },
        },
      },
    }
  
```

### ts-proto/testapis.empty_types

- 旧ファイル: `e2e/tests/pothos--empty_types--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.empty_types`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          _
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "_": true,
        },
      },
    }
  
```

### ts-proto/testapis.enums

- 旧ファイル: `e2e/tests/pothos--enums--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.enums`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          ...Message
        }
      }
      fragment Message on MessageWithEnums {
        requiredMyEnum
        requiredMyEnumWithoutUnspecified
        optionalMyEnum
        optionalMyEnumWithoutUnspecified
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalMyEnum": null,
          "optionalMyEnumWithoutUnspecified": "FOO",
          "requiredMyEnum": "BAR",
          "requiredMyEnumWithoutUnspecified": "FOO",
        },
      },
    }
  
```

### ts-proto/testapis.extensions

- 旧ファイル: `e2e/tests/pothos--extensions--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.extensions`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        testSquashedUnion {
          squashedMessage {
            ... on TestPrefixPrefixedMessageInnerMessage {
              ...Inner
            }
            ... on TestPrefixPrefixedMessageInnerMessage2 {
              ...Inner2
            }
          }
        }
      }
      fragment Inner on TestPrefixPrefixedMessageInnerMessage {
        body
      }
      fragment Inner2 on TestPrefixPrefixedMessageInnerMessage2 {
        body
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "testSquashedUnion": {
          "squashedMessage": {
            "body": "field 2",
          },
        },
      },
    }
  
```

### ts-proto/testapis.field_behavior

- 旧ファイル: `e2e/tests/pothos--field_behavior--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.field_behavior`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          requiredField {
            body
          }
          outputOnlyField {
            body
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "outputOnlyField": null,
          "requiredField": {
            "body": "hello",
          },
        },
      },
    }
  
```

### ts-proto/testapis.multipkgs

- 旧ファイル: `e2e/tests/pothos--multipkgs--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.multipkgs`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          message {
            body
          }
          enum
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "enum": "BAR",
          "message": {
            "body": "hello",
          },
        },
      },
    }
  
```

### ts-proto/testapis.nested

- 旧ファイル: `e2e/tests/pothos--nested--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.nested`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        test {
          body
          nested {
            nestedBody
          }
          nestedEnum
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "body": "hello",
          "nested": {
            "nestedBody": "world",
          },
          "nestedEnum": "BAR",
        },
      },
    }
  
```

### ts-proto/testapis.oneof

- 旧ファイル: `e2e/tests/pothos--oneof--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.oneof`
- 主検証観点: union/oneof の解決

#### クエリ

```graphql
      query Test {
        test {
          requiredOneofMembers {
            ... on OneofMemberMessage1 {
              body
            }
            ... on OneofMemberMessage2 {
              imageUrl
            }
          }
          optionalOneofMembers {
            ... on OneofMemberMessage1 {
              body
            }
            ... on OneofMemberMessage2 {
              imageUrl
            }
          }
        }
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalOneofMembers": null,
          "requiredOneofMembers": {
            "body": "hello",
          },
        },
      },
    }
  
```

### ts-proto/testapis.primitives

- 旧ファイル: `e2e/tests/pothos--primitives--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.primitives`
- 主検証観点: プリミティブ型・スカラー変換

#### クエリ

```graphql
      query Test {
        test {
          requiredPrimitives {
            ...Primitives
          }
          optionalPrimitives {
            ...Primitives
          }
          requiredPrimitivesList {
            ...Primitives
          }
          optionalPrimitivesList {
            ...Primitives
          }
        }
      }
      fragment Primitives on Primitives {
        requiredDoubleValue
        requiredFloatValue
        requiredInt32Value
        requiredInt64Value
        requiredUint32Value
        requiredUint64Value
        requiredSint32Value
        requiredSint64Value
        requiredFixed32Value
        requiredFixed64Value
        requiredSfixed32Value
        requiredSfixed64Value
        requiredBoolValue
        requiredStringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "test": {
          "optionalPrimitives": null,
          "optionalPrimitivesList": [],
          "requiredPrimitives": {
            "requiredBoolValue": true,
            "requiredDoubleValue": 2.4,
            "requiredFixed32Value": 9,
            "requiredFixed64Value": "10",
            "requiredFloatValue": 3.5,
            "requiredInt32Value": 2,
            "requiredInt64Value": "4",
            "requiredSfixed32Value": 11,
            "requiredSfixed64Value": "12",
            "requiredSint32Value": 7,
            "requiredSint64Value": "8",
            "requiredStringValue": "foobar",
            "requiredUint32Value": 5,
            "requiredUint64Value": "6",
          },
          "requiredPrimitivesList": [],
        },
      },
    }
  
```

### ts-proto/testapis.proto3_optional

- 旧ファイル: `e2e/tests/pothos--proto3_optional--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.proto3_optional`
- 主検証観点: レスポンスのフィールド値マッピング

#### クエリ

```graphql
      query Test {
        valuesArePresent {
          ...Message
        }
      }
      fragment Message on Message {
        requiredStringValue
        optionalStringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "valuesArePresent": {
          "optionalStringValue": "optional field",
          "requiredStringValue": "required field",
        },
      },
    }
  
```

### ts-proto/testapis.wktypes

- 旧ファイル: `e2e/tests/pothos--wktypes--ts-proto/schema.test.ts`
- Golden ディレクトリ: `tests/golden/ts-proto/testapis.wktypes`
- 主検証観点: Well-Known Types の変換

#### クエリ

```graphql
      query Test {
        valuesArePresent {
          ...Message
        }
      }
      fragment Message on Message {
        timestamp
        int32Value
        int64Value
        uint32Value
        uint64Value
        floatValue
        doubleValue
        boolValue
        stringValue
      }
    
```

#### 旧期待レスポンス（inline snapshot）

```ts
    {
      "data": {
        "valuesArePresent": {
          "boolValue": true,
          "doubleValue": 2.4,
          "floatValue": 3.5,
          "int32Value": 2,
          "int64Value": "4",
          "stringValue": "foobar",
          "timestamp": 2020-12-28T06:42:05.453Z,
          "uint32Value": 5,
          "uint64Value": "6",
        },
      },
    }
  
```

