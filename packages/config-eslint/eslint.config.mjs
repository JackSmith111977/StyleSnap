import js from 'eslint';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import nextPlugin from '@next/eslint-plugin-next';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
const config = [
  // 全局忽略模式
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
    ],
  },

  // 基础配置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js
      ...nextPlugin.configs.recommended.rules,

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      // 禁止显式 any 类型（强制类型安全）
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          fixToUnknown: false, // 不自动替换为 unknown
        },
      ],
      // 禁止未处理的 Promise（防止异步错误被忽略）
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreVoid: true, // 允许 void 操作符显式忽略
        },
      ],
      // 禁止将 any 类型值赋给有类型的变量
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      // 优先使用空值合并运算符 ?? 而不是 ||
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      // 优先使用可选链操作符 ?.
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // P2 代码风格
      // 函数返回类型显式声明（提高代码可读性和类型安全性）
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true, // 允许箭头函数隐式返回
          allowHigherOrderFunctions: true, // 允许高阶函数
          allowTypedFunctionExpressions: true, // 允许有类型标注的函数表达式
        },
      ],
      // 数组类型统一使用 T[] 语法（更简洁）
      '@typescript-eslint/array-type': [
        'warn',
        {
          default: 'array-simple', // 简单类型用 T[]，复杂类型用 Array<T>
        },
      ],
      // 优先使用 const（不可变性优先）
      'prefer-const': [
        'error',
        {
          destructuring: 'all', // 解构赋值时只要有一个变量未重新赋值就使用 let
          ignoreReadBeforeAssign: false,
        },
      ],
      // 禁止使用 var（使用 let/const 替代）
      'no-var': 'error',
    },
  },

  // Prettier 配置 (必须放在最后)
  prettier,
];

export default config;
