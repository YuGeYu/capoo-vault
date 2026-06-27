-- 网站更新合集公告 (2026-06-27)
-- 使用 INSERT OR REPLACE，ID 固定，可重复执行
INSERT OR REPLACE INTO announcements (
  id,
  title,
  content,
  is_active,
  sort_order,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at
) VALUES (
  'notice_20260627_site_updates',
  '2026年6月27日网站更新合集',
  '最近网站更新比较多，这里一次说完整：1. 新版首页完成一轮增强，浏览入口、工具入口和移动端体验更顺手；2. 猫猫虫仓库 Android APP v1.0.0 已上线，可从首页、页脚或 /app 页面下载；3. APK 已接入稳定下载链路，支持 latest.apk、版本元数据和软件更新 API；4. APP 下载页会展示版本、文件大小、包名和 SHA256，方便校验安装包；5. /app 已加入 sitemap 和 SEO 页面信息；6. 页脚入口和样式已修复，公告页、工具页、APP 页显示恢复正常；7. 后台加载、文件夹浏览统计和相关索引继续优化，网站管理和公开浏览会更稳定。',
  1,
  0,
  NULL,
  NULL,
  datetime('now'),
  datetime('now')
);
