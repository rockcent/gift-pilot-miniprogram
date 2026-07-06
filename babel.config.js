// Taro 构建 babel 配置（同时覆盖 taro build:weapp / build:h5 + Jest）。
// 注：Taro H5 走 babel-preset-taro，自带 JSX automatic runtime；Jest 仍走 @babel/preset-env。
module.exports = (api) => {
  const isTest = api.env('test');
  if (isTest) {
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript'],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    };
  }
  return {
    presets: [
      ['taro', { framework: 'react', ts: true }]
    ]
  };
};
