/** @type {import("prettier").Config} */
const config = {
  // 每行最大字符数
  printWidth: 100,
  // 缩进空格数
  tabWidth: 2,
  // 使用空格缩进
  useTabs: false,
  // 行尾分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // JSX 使用双引号
  jsxSingleQuote: false,
  // 尾随逗号 (ES5 标准)
  trailingComma: 'es5',
  // 对象空格
  bracketSpacing: true,
  // JSX 标签括号
  bracketSameLine: false,
  // 箭头函数单参数括号
  arrowParens: 'always',
  // 格式化嵌入内容
  embeddedLanguageFormatting: 'auto',
  // 单引号优先于双引号
  quoteProps: 'as-needed',
  // 插件配置
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind CSS 类名排序
  tailwindAttributes: ['className', 'class'],
  tailwindFunctions: ['clsx', 'cn', 'tw'],
};

export default config;
