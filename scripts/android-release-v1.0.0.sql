-- 插入 Android APP 发布记录

INSERT INTO software_releases (
  id,
  project_id,
  channel,
  version,
  title,
  summary,
  items_json,
  download_type,
  download_label,
  download_url,
  download_code,
  severity,
  is_active,
  published_at,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at
)
VALUES (
  'release_maomaochong_android_prod_1_0_0',
  'maomaochong-android',
  'prod',
  '1.0.0',
  '猫猫虫仓库 Android APP v1.0.0',
  '首个 Android 版本发布！轻量级原生 WebView 应用，仅 18 KB，支持文件上传下载、登录状态保持等完整功能。',
  '["✨ 首个 Android 版本发布","📱 极致轻量：APK 仅 18 KB","🚀 原生 WebView 实现，快速流畅","📤 支持文件上传（投稿、头像等）","📥 支持文件下载（图片、视频）","🔐 登录状态保持","🌐 智能链接跳转","🇨🇳 完全离线 Google Play Services","📲 最低支持 Android 6.0+"]',
  'apk',
  '下载安卓 APK',
  '/downloads/maomaochong-android/latest.apk',
  '',
  'recommended',
  1,
  '2026-06-27T01:29:51.159Z',
  NULL,
  NULL,
  '2026-06-27T01:35:00.000Z',
  '2026-06-27T01:35:00.000Z'
)
ON CONFLICT(project_id, channel, version) DO UPDATE SET
  title = excluded.title,
  summary = excluded.summary,
  items_json = excluded.items_json,
  download_type = excluded.download_type,
  download_label = excluded.download_label,
  download_url = excluded.download_url,
  download_code = excluded.download_code,
  severity = excluded.severity,
  is_active = excluded.is_active,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
