import { defineConfig } from '@tarojs/cli';
import path from 'node:path';

export default defineConfig(async (ctx, _argv) => {
  const isH5 = ctx.runOpts?.options?.type === 'h5';
  // 公网部署在 https://gift.rockcent.com/h5/ 子路径
  // Taro 3.x 实际从顶层 config.publicPath 读（类型定义虽然写在 h5.publicPath 但代码不展开）
  const PUBLIC_PATH = '/h5/';
  const configCommon = {
    projectName: 'gift-pilot',
    date: '2026-7-6',
    designWidth: 750,
    deviceRatio: { 640: 2.34 / 2, 750: 1, 828: 1.81 / 2, 375: 2 / 1 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-framework-react'],
    defineConstants: {},
    copy: { patterns: [], options: {} },
    framework: 'react',
    compiler: 'webpack5',
    cache: { enable: false },
    } as const;

  if (isH5) {
    return {
      ...configCommon,
      publicPath: PUBLIC_PATH,
      mini: undefined,
      h5: {
        publicPath: PUBLIC_PATH,
        staticDirectory: 'static',
        output: {
          filename: 'js/[name].[hash:8].js',
          chunkFilename: 'js/[name].[chunkhash:8].js'
        },
        miniCssExtractPluginOption: {
          ignoreOrder: true,
          filename: 'css/[name].[hash].css'
        },
        postcss: {
          autoprefixer: { enable: true }
        },
        devServer: {
          port: 5174,
          host: '127.0.0.1',
          open: false
        }
      },
      // 强制 webpack runtime 用 /h5/ 拼接动态 chunk 路径
      // （Taro 3.x 的 H5Combination 不会自动传递 publicPath 到 output，运行时 chunk 仍走绝对路径 /css/824.css）
      webpackChain(chain: any) {
        chain.output.publicPath(PUBLIC_PATH);
        chain.output.set('publicPath', PUBLIC_PATH);
      }
    };
  }

  return {
    ...configCommon,
    mini: {
      webpackChain(chain: any) {
        chain.optimization.minimize(false);
      },
      postcss: {
        autoprefixer: { enable: false }
      }
    }
  };
});
