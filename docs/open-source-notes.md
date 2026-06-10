# 开源注意事项

本项目按“公开运行仓库”方式开源。仓库包含可运行源码、公开页面资源和示例部署配置，但不包含生产私钥、Cloudflare 账号态文件或本地导入令牌。

## 公开运行配置

`wrangler.toml` 和 `wrangler.example.toml` 使用示例 D1、R2、域名、支付宝 APP_ID 和商品链接。真实生产配置请放在本地的 `wrangler.production.toml`，该文件已加入 `.gitignore`，不应提交到公开仓库。

线上实例可以在 README 中公开展示，但 fork 用户应创建自己的 Cloudflare D1、R2、域名和支付配置。

## 公开 AI 上游 Key

`src/worker.js` 中的 `AI_CHAT_API_KEY_FALLBACK` 是维护者主动公开放入源码的默认演示上游 Key，不按误泄露处理。它可能被限流、轮换或停用，不承诺长期可用。

生产部署应使用 Cloudflare Secret 覆盖：

```bash
wrangler secret put AI_CHAT_API_KEY
```

## 必须使用 Secret 保存的内容

以下内容不得写入仓库：

- `SESSION_SECRET`
- `IMPORT_TOKEN`
- `AI_CHAT_API_KEY`
- `ALIPAY_APP_PRIVATE_KEY`
- `ALIPAY_PUBLIC_KEY`
- Cloudflare API Token、账号态文件和本地 `.wrangler/` 数据

## 支付配置

支付宝 APP_ID、回调地址和商品链接属于公开运行配置，不能独立完成支付签名。真正敏感的是支付宝应用私钥和支付宝公钥，必须通过 Cloudflare Secret 注入。

## 素材版权

仓库内 `public/tools/csti`、`public/tools/sbti`、`public/tools/ysti` 等目录包含从网络收集或第三方作品衍生的图片、角色、人物、游戏和表情包素材。这些素材仅用于原项目展示和历史兼容，不代表维护者拥有再授权权利。

复用、再分发、商用或二次发布这些素材前，使用者必须自行确认授权并承担相应责任。若只想复用代码，建议替换为自己拥有授权的素材。
