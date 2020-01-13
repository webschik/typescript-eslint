import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Types = Record<
  string,
  | string
  | null
  | {
      message: string;
      fixWith?: string;
    }
>;

type Options = [
  {
    types: Types;
  },
];
type MessageIds = 'bannedTypeMessage';

function removeSpaces(str: string): string {
  return str.replace(/ /g, '');
}

function stringifyTypeName(
  node: TSESTree.EntityName | TSESTree.TSTypeLiteral,
  sourceCode: TSESLint.SourceCode,
): string {
  return removeSpaces(sourceCode.getText(node));
}

function getCustomMessage(
  bannedType: null | string | { message?: string; fixWith?: string },
): string {
  if (bannedType === null) {
    return '';
  }

  if (typeof bannedType === 'string') {
    return ` ${bannedType}`;
  }

  if (bannedType.message) {
    return ` ${bannedType.message}`;
  }

  return '';
}

export default util.createRule<Options, MessageIds>({
  name: 'ban-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Bans specific types from being used',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      bannedTypeMessage: "Don't use '{{name}}' as a type.{{customMessage}}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          types: {
            type: 'object',
            additionalProperties: {
              oneOf: [
                { type: 'null' },
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    fixWith: { type: 'string' },
                  },
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      types: {
        // use lower-case instead
        String: {
          message: 'Use string instead',
          fixWith: 'string',
        },
        Boolean: {
          message: 'Use boolean instead',
          fixWith: 'boolean',
        },
        Number: {
          message: 'Use number instead',
          fixWith: 'number',
        },
        Symbol: {
          message: 'Use symbol instead',
          fixWith: 'symbol',
        },

        Function: {
          message: [
            'The `Function` type accepts any function-like value.',
            'It provides no type-safety when calling the function, which can be a common source of bugs.',
            'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
            'If you are expecting the function to accept certain arguments, you should explicitly define function shape.',
          ].join('\n'),
        },

        // object typing
        Object: {
          message: [
            'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
            '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
            '- If you want a type meaning "any value", you probably want `unknown` instead.',
          ].join('\n'),
        },
        '{}': {
          message: [
            '`{}` actually means "any non-nullish value".',
            '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
            '- If you want a type meaning "any value", you probably want `unknown` instead.',
          ].join('\n'),
        },
        object: {
          message: [
            'The `object` type is currently hard to use (see https://github.com/microsoft/TypeScript/issues/21732).',
            'Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.',
          ].join('\n'),
        },
      },
    },
  ],
  create(context, [{ types }]) {
    const bannedTypes: Types = Object.keys(types).reduce(
      (res, type) => ({ ...res, [removeSpaces(type)]: types[type] }),
      {},
    );

    function checkBannedTypes(
      typeNode: TSESTree.EntityName | TSESTree.TSTypeLiteral,
    ): void {
      const name = stringifyTypeName(typeNode, context.getSourceCode());

      if (name in bannedTypes) {
        const bannedType = bannedTypes[name];
        const customMessage = getCustomMessage(bannedType);
        const fixWith =
          bannedType && typeof bannedType === 'object' && bannedType.fixWith;

        context.report({
          node: typeNode,
          messageId: 'bannedTypeMessage',
          data: {
            name,
            customMessage,
          },
          fix: fixWith
            ? (fixer): TSESLint.RuleFix => fixer.replaceText(typeNode, fixWith)
            : null,
        });
      }
    }

    return {
      TSTypeLiteral(node): void {
        if (node.members.length) {
          return;
        }

        checkBannedTypes(node);
      },
      TSTypeReference({ typeName }): void {
        checkBannedTypes(typeName);
      },
    };
  },
});
