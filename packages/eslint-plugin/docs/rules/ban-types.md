# Bans specific types from being used (`ban-types`)

This rule bans specific types and can suggest alternatives. It does not ban the
corresponding runtime objects from being used.

## Rule Details

Examples of **incorrect** code for this rule `"String": "Use string instead"`

```ts
class Foo<F = String> extends Bar<String> implements Baz<String> {
  constructor(foo: String) {}

  exit(): Array<String> {
    const foo: String = 1 as String;
  }
}
```

Examples of **correct** code for this rule `"String": "Use string instead"`

```ts
class Foo<F = string> extends Bar<string> implements Baz<string> {
  constructor(foo: string) {}

  exit(): Array<string> {
    const foo: string = 1 as string;
  }
}
```

## Options

```ts
type Options = {
  types: {
    [typeName: string]:
      | string
      | {
          message: string;
          fixWith?: string;
        };
  };
};
```

The rule accepts a single object as options, with the key `types`.

- The keys should match the types you want to ban. The type can either be a type name literal (`Foo`), a type name with generic parameter instantiation(s) (`Foo<Bar>`), or the empty object literal (`{}`).
- The values can be an object with the following properties:
  - `message: string` - the message to display when the type is matched.
  - `fixWith?: string` - a string to replace the banned type with when the fixer is run. If this is omitted, no fix will be done.

### Example config

```JSONC
{
    "@typescript-eslint/ban-types": ["error", {
        "types": {
            // add a custom message to help explain why not to use it
            "Foo": "Don't use bar!",

            // add a custom message, AND tell the plugin how to fix it
            "String": {
                "message": "Use string instead",
                "fixWith": "string"
            }

            "{}": {
              "message": "Use object instead",
              "fixWith": "object"
            }
        }
    }]
}
```

### Default Options

The default options provides a set of "best practices", intended to provide safety and standardization in your codebase:

- Don't use the upper case primitive types, you should use the lower-case types for consistency.
- Avoid the `Function` type, as it provides little safety for the following reasons:
  - It provides no type-safety when calling the value, which means it's easy to provide the wrong arguments.
  - It accepts class declarations, which will fail when called, as they are called without the `new` keyword.
- Avoid the `Object` and `{}` types, as they means "any non-nullish value".
  - This is a point of confusion for many developers, who think it means "any object type".
- Avoid the `object`, as it is currently hard to use due to not being able to assert that keys exist.
  - See [microsoft/TypeScript#21732](https://github.com/microsoft/TypeScript/issues/21732).

**_Important note:_** the default options suggests using `Record<string, unknown>`; this was a stylistic decision, as the built-in `Record` type is considered to look cleaner.

## Compatibility

- TSLint: [ban-types](https://palantir.github.io/tslint/rules/ban-types/)
