module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 Bug
        'docs', // 文档更新
        'style', // 代码格式调整（不影响功能）
        'refactor', // 重构（既不是新功能也不是修复）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖更改
        'ci', // CI 配置文件和脚本更改
        'chore', // 其他不修改 src 或 test 文件的更改
        'revert', // 回退提交
      ],
    ],
    // 类型小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 类型最大长度
    'type-max-length': [2, 'always', 10],
    // 主题最小长度
    'subject-min-length': [2, 'always', 3],
    // 主题最大长度
    'subject-max-length': [2, 'always', 72],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题结尾不能有句号
    'subject-full-stop': [2, 'never', '.'],
    // header 最大长度
    'header-max-length': [2, 'always', 100],
    // body 以换行开始
    'body-leading-blank': [1, 'always'],
    // footer 以换行开始
    'footer-leading-blank': [1, 'always'],
  },
};
