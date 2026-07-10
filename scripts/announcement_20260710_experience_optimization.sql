-- 网站体验优化公告 (2026-07-10)
-- ID 固定，可重复执行；更新时保留首次发布时间
INSERT INTO announcements (
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
  'notice_20260710_experience_optimization',
  '2026年7月10日网站体验优化公告',
  '猫猫虫咖波表情包仓库已完成一轮体验和稳定性更新，本次更新无需大家进行额外操作。

1. 新版首页正式上线
首页现在可以更方便地切换推荐、最新、热门和工具频道，搜索、个人中心、后台和常用页面入口也更加清楚。

2. 页面加载速度明显提升
优化了首页和分类列表的数据加载方式。打开网站、搜索分类和切换频道时会更快，分类较多时的等待时间也大幅减少。

3. 分类浏览体验继续优化
分类详情、浏览数据和热门内容展示进行了整理，内容排序和数据变化会更加稳定、直观。

4. 手机端和暗色模式更好用
调整了导航、搜索框、频道按钮、分类卡片和详情页操作按钮的尺寸与布局，手机上点击和浏览更加方便。

5. 修复部分异常提示
修复了后台操作、资源下载、账号管理等场景中可能出现的乱码提示，发生问题时会显示正常、清楚的中文说明。

如果页面仍显示旧样式，可以刷新页面后重新打开。使用过程中发现问题，欢迎通过公告页中的联系方式反馈。',
  1,
  -1100,
  NULL,
  NULL,
  datetime('now'),
  datetime('now')
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  content = excluded.content,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_by_user_id = excluded.updated_by_user_id,
  updated_at = datetime('now');
