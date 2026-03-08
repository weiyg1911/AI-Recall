module.exports = {
  // TypeScript 和 JavaScript 文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix', // ESLint 修复
    'prettier --write', // Prettier 格式化
  ],

  // JSON 文件
  '*.{json,jsonc}': ['prettier --write'],

  // Markdown 文件
  '*.md': ['prettier --write'],

  // 样式文件（如果有的话）
  '*.{css,scss,sass,less}': ['prettier --write'],

  // 配置文件
  '*.{yml,yaml}': ['prettier --write'],
};
