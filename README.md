# Capoo Vault

Capoo Vault 是一个运行在 Cloudflare Workers 上的 SPA 项目，后端使用 Worker API，数据存储使用 D1，媒体文件使用 R2。项目包含账号、上传审核、公开素材仓库、工具页、AI 对话 API、AI 抠图、音乐工具和个人中心等功能。

线上实例：<https://maomaochongmiao.600318.xyz>

## 开源声明

本仓库按“公开运行仓库”方式开源。仓库保留可运行源码、前端资源和示例配置，但不包含生产私钥、Cloudflare 账号态文件、导入令牌或本地 `.wrangler/` 数据。

`src/worker.js` 中的 `AI_CHAT_API_KEY_FALLBACK` 是项目维护者主动公开放入源码的默认演示上游 Key，不属于误泄露。该 Key 可能限流、轮换或停用，不承诺长期可用。生产部署应通过 Cloudflare Secret 设置自己的 `AI_CHAT_API_KEY`。

仓库中部分图片、角色、人物、游戏和表情包素材来自网络收集或第三方作品衍生，仅用于原项目展示和历史兼容。复用、再分发、商用或二次发布这些素材前，请自行确认授权并承担相应责任。

## 功能

- 用户注册、登录、会话管理和个人中心。
- 文件夹创建、图片/视频上传、审核、驳回、下架和公开访问。
- 管理员公告、站点设置、用户管理和导入工具。
- AI 对话 API、用户 API Key、每日额度、会员额度和余额扣费。
- AI 抠图会员、支付回调和兑换码相关流程。
- 音乐工具、灵感工具、连连看和独立素材工具页。
- D1 迁移脚本和本地/远程部署脚本。

## 技术栈

- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Cloudflare Workers Static Assets
- 原生 HTML/CSS/JavaScript SPA
- Wrangler

## 目录

- `src/worker.js`：Worker 后端入口，包含 API、鉴权、D1/R2、支付和 AI 上游调用。
- `public/`：SPA 页面、样式、前端模块、模型文件和工具页素材。
- `schema/`：D1 数据库迁移脚本。
- `scripts/`：数据导入和发布记录维护脚本。
- `docs/`：开发记录、架构说明和开源注意事项。
- `wrangler.toml`：公开示例部署配置。
- `wrangler.example.toml`：可复制的配置模板。
- `.env.example`：需要设置为 Cloudflare Secret 的变量示例。

## 部署准备

1. 安装依赖：

```bash
npm install
```

2. 创建 Cloudflare D1 数据库和 R2 Bucket。

3. 根据自己的资源修改 `wrangler.toml`，或复制 `wrangler.example.toml` 为本地配置。真实生产配置建议保存为 `wrangler.production.toml`，该文件已被 `.gitignore` 忽略。

4. 设置 Worker Secret：

```bash
wrangler secret put SESSION_SECRET
wrangler secret put IMPORT_TOKEN
wrangler secret put AI_CHAT_API_KEY
wrangler secret put ALIPAY_APP_PRIVATE_KEY
wrangler secret put ALIPAY_PUBLIC_KEY
```

`AI_CHAT_API_KEY` 可覆盖源码中的公开 fallback key。支付宝私钥和支付宝公钥必须使用 Secret，不要写入源码或配置文件。

5. 执行 D1 迁移：

```bash
npm run db:migrate:local
```

远程环境确认无误后再执行：

```bash
npm run db:migrate:remote
```

6. 本地启动：

```bash
npm run dev
```

7. 部署：

```bash
npm run deploy
```

如果使用单独的生产配置文件，可直接调用 Wrangler：

```bash
npx wrangler deploy --config wrangler.production.toml
```

## 首个账号

首次开放站点前，先自己注册第一个账号。当前逻辑会将首个注册用户设为 `owner` 站长账号。

## 公开前检查

发布公开仓库前建议执行：

```bash
git status --short
rg -n -i "(secret|token|password|private_key|api_key|sk-|bearer|authorization)"
git ls-files
node --check src/worker.js
node --check public/ai-api-tool.js
node --check public/ai-chat-tool.js
```

确认 `.wrangler/`、日志、备份、`.env`、`import-token.txt`、`wrangler.production.toml`、压缩包和生产私钥没有进入 Git。

## 许可证

代码以 MIT License 开源。第三方图片、角色、人物、游戏和表情包素材不因本仓库开源而自动获得再授权，详见 [docs/open-source-notes.md](docs/open-source-notes.md)。
