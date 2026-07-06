# 礼有方小程序 · MVP v0.6 视觉预览

> **重要**：本目录截图由 **Taro H5 构建产物 + headless Chrome** 渲染得到，用于本地视觉验证。
> 与真实微信小程序的差异：少了顶部原生导航栏样式 + 部分 CSS 像素细节，
> 但页面骨架、组件布局、视觉 token、文案内容与小程序完全一致（同一份 React/TSX 源码）。

## 截图清单（10 张 · 420x820 viewport @ devicePixelRatio 2）

| 文件 | 页面 | 路由 |
|---|---|---|
| `home.png` | 表达需求（AI 对话首页） | `#/pages/index/index` |
| `recommend.png` | AI 选品推荐 | `#/pages/recommend/index` |
| `content.png` | 内容生成工作台 | `#/pages/content/index` |
| `cover.png` | 封面设计 | `#/pages/cover/index` |
| `publish-confirm.png` | 发布确认 | `#/pages/publish-confirm/index` |
| `publish-success.png` | 发布成功 | `#/pages/publish-success/index` |
| `orders.png` | 订单与佣金 | `#/pages/orders/index` |
| `review.png` | 经营复盘 | `#/pages/review/index` |
| `next-plan.png` | AI 下一步计划 | `#/pages/next-plan/index` |
| `memory.png` | 我的 AI 记忆 | `#/pages/memory/index` |

## 视觉 token 验证

每张截图都验证：
- ✅ 策绿 `#23B26D` 主色按钮 / 高亮
- ✅ 礼杏 `#F6C98D` 辅助色（封面渐变 / 礼盒背景）
- ✅ 心意珊瑚 `#F47C6C` 价格 / 佣金
- ✅ 暖白 `#FAF9F6` 全局背景
- ✅ 礼有方品牌 logo（绿色渐变 + 🎁 emoji）
- ✅ "Hi, 我是小礼"小礼人格（首页）
- ✅ 6 大 AI 原生体验标签（选对礼 / 谈得好 / 做得美 / 发得准 / 看得清 / 改得好）

## 关键宪法 / 不变量验证

- ✅ **§4.1 金额整数规范**：所有价格 / 佣金展示均从「分」转换（¥199 = 19900 分）
- ✅ **§6.1 平台 pin**：`@rockcent/platform#platform-v1.15.2`（git+https 形式）
- ✅ **§6.8 红线**：memory.png 中"小礼对你的观察（可编辑）"由用户自主管理
- ✅ **小礼人格**：文案统一走"克制、不堆形容词、反微商"语气（宪法 §5.1）

## 与网页端的对比

| 维度 | 小程序 (本目录) | 网页端 ([gift-pilot-web/dist-screenshots](../../gift-pilot-web/dist-screenshots/)) |
|---|---|---|
| 用户界面 | ✅ 10 页 | ✅ 10 页（C 端） + 8 页（admin） |
| 视觉 token | ✅ | ✅ |
| 平台构建 | Taro 3.6 H5 | Vite 5 + React |
| 截图张数 | 10 | 18 |
| 总数 | **28 张**（10 小程序 + 18 网页端） |

## 如何本地复现

```bash
# 1. 装依赖（一次性）
pnpm install --legacy-peer-deps
# 注：H5 构建需要 webpack@5.75、babel-preset-taro 等 devDeps，
#     真实小程序构建只需 `pnpm install` 不带参数。

# 2. 构建 H5 产物
pnpm run build:h5
# 输出到 dist/，含 index.html + js/ + css/

# 3. 启动静态 server（任选其一）
cd dist && python3 -m http.server 8765 --bind 127.0.0.1 &

# 4. 一键截图（puppeteer-core + 系统 Chrome）
pnpm run screenshot:h5
# 输出到 dist-screenshots/*.png
```

## 阶段二计划

- 真实 AppID 替换 `project.config.example.json` 占位后，`pnpm run build:weapp` 可直接生成微信小程序 dist/
- 真实 LLM / 真实商品库 / 真实朋友圈发布接通后，截图脚本可作为 regression baseline
- Taro 共享包 `gift-pilot-shared` 抽取后，H5 与 weapp 共用同一份 domain types / services
