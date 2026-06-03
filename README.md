# maomaochongtz 后台版

这个目录是给 `猫猫虫咖波表情包仓库` 准备的新项目骨架，目标不是继续手工维护 `build.py + data.js`，而是把站点升级成一套完整的“上传 -> 审核 -> 发布”系统。

## 现在已经落下来的内容

- `src/worker.js`
  Cloudflare Worker API，负责注册登录、会话、投稿上传、审核、公告、站点设置、站长用户管理。
- `schema/001_init.sql`
  D1 数据库初始化脚本。
- `public/index.html`
  前台和后台共用的 SPA 入口。
- `public/app.js`
  响应式前台 + 工作台交互逻辑。
- `public/styles.css`
  前台和后台共用样式。
- `wrangler.toml`
  Cloudflare Workers + D1 + R2 + 静态资源配置。
- `docs/architecture.md`
  架构说明、迁移思路和后续接入建议。

## 核心能力

1. 用户可以注册 / 登录账号。
2. 登录后可以创建文件夹，上传常见图片和视频文件。
3. 上传后默认进入 `待审核` 状态。
4. 管理员 / 站长可以审核通过、驳回、下架。
5. 审核通过后，前台会生成公开路径 `https://你的域名/文件夹路径`。
6. 站长可以给别人升管理员，也可以删除普通用户 / 管理员账号。
7. 管理员可以维护站内公告和站点说明。

## 推荐的 Cloudflare 资源

- Workers: 跑 API 和媒体代理
- D1: 账号、会话、文件夹、审核记录、公告等结构化数据
- R2: 原始图片 / 视频文件
- 现有域名: `https://maomaochong.600318.xyz/`

## 首次部署前要做的事

1. 创建一个 D1 数据库，把 `schema/001_init.sql` 执行进去。
2. 创建一个 R2 Bucket，用于保存上传文件。
3. 修改 [wrangler.toml](/D:/document/html/猫猫虫仓库有后台/wrangler.toml) 里的 `database_id`、`bucket_name` 等占位值。
4. 设置 Worker Secret:
   - `SESSION_SECRET`
5. 部署 Worker。

首次开放站点前，先自己注册第一个账号。当前骨架里“首个注册用户”会自动成为 `owner` 站长账号。

## 本地调试

```bash
npm install
npm run db:migrate:local
npm run dev
```

## 这套方案和旧站的关系

旧站是“扫描目录生成静态页面”。

新站是“数据和文件都先进后台，再由审核结果决定是否公开”。

两套方案可以并行一段时间，等你确认后台工作流顺手，再把旧站内容逐步迁移过来。
