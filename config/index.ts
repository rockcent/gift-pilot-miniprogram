import { defineConfig } from '@tarojs/cli';
import path from 'node:path';

export default defineConfig(async (ctx, _argv) => {
  const isH5 = ctx.runOpts?.options?.type === 'h5';
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
      mini: undefined,
      h5: {
        publicPath: '/',
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
