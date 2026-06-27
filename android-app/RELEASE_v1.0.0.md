# 猫猫虫仓库 Android APP - Release v1.0.0

**构建日期**: 2026年6月27日  
**构建状态**: ✅ 成功

---

## APK 信息

### 基本信息
- **文件名**: `maomaochong-android-v1.0.0.apk`
- **文件路径**: `android-app/dist/maomaochong-android-v1.0.0.apk`
- **文件大小**: **18,413 字节** (约 18 KB) ✅ **远小于 25MB 要求**
- **SHA256**: `a6e6cd4ea643f5a6c60d97382b03df589f02b2a5107688539577ea316e7c6c9d`

### 应用信息
- **包名**: `xyz.maomaochongmiao.app`
- **应用名称**: 猫猫虫仓库
- **versionName**: `1.0.0`
- **versionCode**: `1`
- **minSdkVersion**: `23` (Android 6.0)
- **targetSdkVersion**: `35` (Android 15)
- **compileSdkVersion**: `35`

### 签名信息
- **签名证书 SHA256 指纹**:  
  `C7:B0:19:C3:D3:44:59:09:E6:B5:10:16:6A:B8:3F:44:88:63:EE:A7:B9:27:A2:FD:FE:48:CA:99:83:F4:7A:1E`
- **签名证书 SHA1 指纹**:  
  `70:8D:D9:D0:4B:64:78:52:24:64:AE:3F:6D:1E:BF:B0:15:7D:40:35`
- **证书有效期**: 2026年6月26日 至 2056年6月18日 (30年)
- **证书主体**: `CN=Maomaochong Vault, OU=App, O=Maomaochongmiao, L=Unknown, ST=Unknown, C=CN`
- **签名算法**: SHA256withRSA
- **密钥长度**: 2048位 RSA

---

## 功能实现清单

### ✅ 已实现的核心功能

#### 1. WebView 基础能力
- ✅ 启用 JavaScript
- ✅ 启用 DOM Storage
- ✅ 启用 Cookie (包括第三方 Cookie)
- ✅ 支持 HTTPS 页面加载
- ✅ APP 启动直接打开网站首页 (`https://maomaochongmiao.600318.xyz/?utm_source=android_app`)

#### 2. 导航规则
- ✅ `maomaochongmiao.600318.xyz` 留在 WebView 内打开
- ✅ 外部链接走系统浏览器或对应 APP
- ✅ QQ 联系链接跳转到 QQ APP
- ✅ 特殊协议链接（tel:, mailto:, intent: 等）正确处理

#### 3. 返回键
- ✅ WebView 有历史记录时执行网页后退
- ✅ 没有历史记录时退出 APP

#### 4. 文件上传
- ✅ 实现 `WebChromeClient.onShowFileChooser`
- ✅ 支持图片、视频等站内投稿选择
- ✅ 支持单文件和多文件选择
- ✅ 中文提示信息

#### 5. 文件下载
- ✅ 设置 `DownloadListener`
- ✅ 调用 Android `DownloadManager`
- ✅ 下载时带上 Cookie/User-Agent
- ✅ 下载目录使用系统公开下载目录
- ✅ 下载失败或无权限时给中文提示
- ✅ 下载完成时系统通知

#### 6. 错误页
- ✅ 网络失败显示中文错误提示
- ✅ 提供"重试"按钮
- ✅ 不显示默认空白页

#### 7. 安全和体积
- ✅ release 关闭 WebView 调试 (`WebView.setWebContentsDebuggingEnabled(false)`)
- ✅ 不添加广告、统计、推送 SDK
- ✅ 不请求无关权限
- ✅ 不把网站静态资源打包进 APK
- ✅ 启用代码混淆和资源压缩
- ✅ 仅保留中文和英文资源

### 权限清单
仅使用以下必要权限：
- `android.permission.INTERNET` - 网络访问
- `android.permission.ACCESS_NETWORK_STATE` - 检查网络状态

---

## 技术亮点

### 极致轻量
- **18 KB APK**: 通过以下技术实现：
  - 零依赖：不使用 AndroidX、appcompat 等库
  - 纯原生框架 API
  - 代码混淆 (R8) + 资源压缩
  - 仅保留中英文资源
  - 无本地资源打包

### 中国大陆优化
- ✅ 不依赖 Google Play Services
- ✅ minSdk 23 兼容绝大多数安卓设备
- ✅ 使用阿里云 Maven 镜像加速构建
- ✅ 所有提示信息为中文

### 代码质量
- 纯 Java 17 实现
- 完整的生命周期管理
- 内存泄漏防护
- 状态保存和恢复
- 异常处理完善

---

## 构建命令

### 清理构建
```powershell
cd android-app
.\gradlew.bat clean
```

### 构建 Release APK
```powershell
cd android-app
.\gradlew.bat assembleRelease
```

### 产物路径
```
android-app/app/build/outputs/apk/release/app-release.apk
```

### 复制到分发目录
```powershell
cp app/build/outputs/apk/release/app-release.apk dist/maomaochong-android-v1.0.0.apk
```

---

## 测试验收记录

### 待测试项目清单

基础功能测试：
- [ ] APK 能安装到安卓模拟器或真机
- [ ] 启动后能打开网站首页
- [ ] 能进入分类详情页
- [ ] 能打开登录/注册入口

文件操作测试：
- [ ] 能触发图片或视频下载
- [ ] 下载通知正常显示
- [ ] 下载的文件能在系统下载目录找到
- [ ] 能触发投稿文件选择器
- [ ] 能选择单个图片上传
- [ ] 能选择多个文件上传

导航测试：
- [ ] 返回键在有历史时网页后退
- [ ] 返回键在无历史时退出APP
- [ ] 外部链接能跳出到浏览器
- [ ] QQ 联系链接能跳转到 QQ APP

异常处理测试：
- [ ] 断网时显示中文错误页
- [ ] 错误页的重试按钮有效
- [ ] 下载失败时有中文提示

性能测试：
- [ ] release APK < 25MB ✅ (实际 18KB)
- [ ] 首次启动流畅
- [ ] 页面滚动流畅
- [ ] 内存占用合理

---

## 文件结构

```
android-app/
├── app/
│   ├── build.gradle                 # 应用构建配置
│   ├── proguard-rules.pro          # ProGuard 规则
│   └── src/main/
│       ├── AndroidManifest.xml      # 清单文件
│       ├── java/xyz/maomaochongmiao/app/
│       │   └── MainActivity.java    # 主活动（457行）
│       └── res/
│           ├── mipmap-*/            # 应用图标
│           └── values/
│               ├── strings.xml      # 字符串资源
│               └── styles.xml       # 样式定义
├── gradle/                          # Gradle Wrapper
├── signing/
│   └── maomaochong-release.jks     # 发布签名证书（不进 Git）
├── dist/
│   └── maomaochong-android-v1.0.0.apk  # 分发 APK
├── build.gradle                     # 项目构建配置
├── settings.gradle                  # 项目设置（含阿里云镜像）
├── gradle.properties                # Gradle 属性
├── gradlew / gradlew.bat           # Gradle Wrapper 脚本
├── keystore.properties             # 签名配置（不进 Git）
├── local.properties                # 本地 SDK 路径（不进 Git）
└── .gitignore                      # Git 忽略配置
```

---

## 注意事项

### ⚠️ 重要：签名证书管理
1. **签名证书位置**: `android-app/signing/maomaochong-release.jks`
2. **证书已配置在**: `android-app/keystore.properties`
3. **证书不在 Git 中**: 已通过 `.gitignore` 排除
4. **证书有效期 30 年**: 2026-2056
5. **后续发布必须使用同一证书**: 否则用户无法升级，只能卸载重装

### 📦 APK 分发
- APK 文件位于: `android-app/dist/maomaochong-android-v1.0.0.apk`
- 可直接分发此文件
- 用户需要允许"未知来源"安装

### 🔐 安全建议
- 妥善保管 `maomaochong-release.jks` 和 `keystore.properties`
- 考虑备份到安全的离线存储
- 如需团队协作，使用加密方式共享证书

---

## 第一步交付清单

✅ **已完成**:
- [x] `android-app/` 工程完整
- [x] `android-app/dist/maomaochong-android-v1.0.0.apk` 已生成
- [x] APK 字节大小: 18,413 bytes (< 25MB ✅)
- [x] APK SHA256: 已记录
- [x] APP 包名: `xyz.maomaochongmiao.app`
- [x] versionName: `1.0.0`
- [x] versionCode: `1`
- [x] 签名证书 SHA256 指纹: 已记录
- [x] 构建命令可重复执行

⏳ **待用户测试**:
- [ ] 安装测试
- [ ] 首页访问
- [ ] 下载功能
- [ ] 文件选择
- [ ] 返回键行为

---

## 下一步计划

根据方案，第一步仅负责 APK 制作和验证，**不包括**：
- ❌ 修改网站下载入口
- ❌ 部署 Worker
- ❌ 修改 `wrangler.toml`

这些内容将在**第二步**执行。

---

## 联系信息

如有问题，请参考：
- 源码位置: `android-app/app/src/main/java/xyz/maomaochongmiao/app/MainActivity.java`
- 构建配置: `android-app/app/build.gradle`
- 项目配置: `android-app/settings.gradle`
