# 猫猫虫仓库 Android APP

轻量级 WebView 原生应用，为中国大陆 Android 用户提供最佳体验。

## 📦 快速信息

- **APK 大小**: 18 KB（极致轻量）
- **最低系统**: Android 6.0 (API 23)
- **目标系统**: Android 15 (API 35)
- **包名**: `xyz.maomaochongmiao.app`
- **当前版本**: 1.0.0

## 🚀 快速开始

### 用户安装

1. 下载 APK: `android-app/dist/maomaochong-android-v1.0.0.apk`
2. 在手机上允许"未知来源"安装
3. 打开 APK 文件安装
4. 启动"猫猫虫仓库"应用

### 开发者构建

```powershell
# 清理
cd android-app
.\gradlew.bat clean

# 构建 Release APK
.\gradlew.bat assembleRelease

# 产物位置
# app/build/outputs/apk/release/app-release.apk
```

### 安装到设备

```bash
# 通过 ADB 安装
adb install dist/maomaochong-android-v1.0.0.apk

# 或安装最新构建
adb install app/build/outputs/apk/release/app-release.apk
```

## ✨ 特性

### 核心功能
- ✅ 完整 WebView 浏览体验
- ✅ 文件上传（投稿、头像）
- ✅ 文件下载（图片、视频）
- ✅ Cookie 和登录状态保持
- ✅ 外部链接跳转（QQ、浏览器）
- ✅ 网络错误中文提示
- ✅ 返回键智能导航

### 技术亮点
- 🎯 **极致轻量**: 仅 18 KB
- 🚫 **零依赖**: 不使用 AndroidX/Play Services
- 🇨🇳 **大陆优化**: 完全离线 Google 服务
- 🔒 **安全**: 代码混淆 + 资源压缩
- ⚡ **性能**: 纯原生框架实现

## 📁 项目结构

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/xyz/maomaochongmiao/app/
│   │   │   └── MainActivity.java          # 主活动（唯一代码文件）
│   │   ├── res/                            # 资源文件
│   │   └── AndroidManifest.xml             # 应用清单
│   ├── build.gradle                        # 应用构建配置
│   └── proguard-rules.pro                  # 混淆规则
├── dist/
│   └── maomaochong-android-v1.0.0.apk     # 发布 APK
├── signing/
│   └── maomaochong-release.jks            # 签名证书（不进 Git）
├── build.gradle                            # 项目构建配置
├── settings.gradle                         # 项目设置
├── keystore.properties                     # 签名配置（不进 Git）
├── RELEASE_v1.0.0.md                      # 发布说明
├── TESTING_GUIDE.md                        # 测试指南
└── README.md                               # 本文件
```

## 🔧 开发环境

### 必需
- **JDK**: 17 或更高
- **Android SDK**: API 35
- **Gradle**: 8.14（使用 Wrapper，无需预装）

### 可选
- **Android Studio**: 用于可视化开发
- **ADB**: 用于设备安装和调试

### 环境变量
```bash
# Windows
set ANDROID_HOME=E:\ai_android_factory\toolchain\android-sdk
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot
```

## 🧪 测试

详细测试指南请参考: [TESTING_GUIDE.md](TESTING_GUIDE.md)

### 快速测试
```bash
# 启动模拟器
emulator -avd Pixel_5_API_30

# 安装 APK
adb install dist/maomaochong-android-v1.0.0.apk

# 查看日志
adb logcat | grep "xyz.maomaochongmiao"
```

### 功能验证清单
- [ ] 启动并加载首页
- [ ] 登录/注册
- [ ] 浏览分类和详情
- [ ] 文件上传（投稿）
- [ ] 文件下载
- [ ] 外部链接跳转
- [ ] 返回键导航
- [ ] 错误页和重试

## 📊 验证信息

### APK 信息
- **SHA256**: `a6e6cd4ea643f5a6c60d97382b03df589f02b2a5107688539577ea316e7c6c9d`
- **签名**: SHA256withRSA (2048位)
- **证书 CN**: Maomaochong Vault
- **证书有效期**: 2026-06-26 至 2056-06-18

### 验证 APK
```powershell
# Windows PowerShell
Get-FileHash dist\maomaochong-android-v1.0.0.apk -Algorithm SHA256

# 或使用 certutil
certutil -hashfile dist\maomaochong-android-v1.0.0.apk SHA256
```

```bash
# Linux/Mac/Git Bash
sha256sum dist/maomaochong-android-v1.0.0.apk
```

## 🔐 签名管理

### 签名文件
- **位置**: `signing/maomaochong-release.jks`
- **别名**: `maomaochong`
- **证书指纹**: 见 `RELEASE_v1.0.0.md`

### ⚠️ 重要警告
- 签名证书已从 Git 排除（`.gitignore`）
- 务必妥善保管证书文件
- 后续版本必须使用同一证书签名
- 证书丢失将无法发布更新（用户必须卸载重装）

### 备份建议
```bash
# 备份签名文件
cp signing/maomaochong-release.jks ~/safe-backup/
cp keystore.properties ~/safe-backup/

# 或加密后备份到云存储
7z a -p -mhe=on maomaochong-signing.7z signing/ keystore.properties
```

## 🏗️ 构建配置

### Gradle 配置
- **编译 SDK**: 35 (Android 15)
- **最小 SDK**: 23 (Android 6.0, 覆盖 99%+ 设备)
- **目标 SDK**: 35
- **构建工具**: 35.0.0

### ProGuard 优化
- ✅ 代码混淆 (minifyEnabled)
- ✅ 资源压缩 (shrinkResources)
- ✅ 优化规则 (proguard-android-optimize.txt)

### 资源配置
- 仅保留语言: 中文 (zh)、英文 (en)
- 无本地静态资源
- 动态图标资源

## 📝 开发日志

### v1.0.0 (2026-06-27)
- ✅ 初始版本发布
- ✅ WebView 基础功能
- ✅ 文件上传/下载
- ✅ 签名和发布配置
- ✅ APK 大小优化至 18 KB

## 🛠️ 故障排查

### 构建失败
```bash
# 清理 Gradle 缓存
./gradlew.bat clean
rm -rf .gradle build app/build

# 重新构建
./gradlew.bat assembleRelease
```

### 签名错误
检查 `keystore.properties` 配置：
```properties
storeFile=signing/maomaochong-release.jks
storePassword=你的密码
keyAlias=maomaochong
keyPassword=你的密码
```

### APK 安装失败
```bash
# 查看详细错误
adb install -r dist/maomaochong-android-v1.0.0.apk

# 查看设备日志
adb logcat | grep -i "package"
```

## 📚 相关文档

- [RELEASE_v1.0.0.md](RELEASE_v1.0.0.md) - 详细发布说明
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - 完整测试指南
- [MainActivity.java](app/src/main/java/xyz/maomaochongmiao/app/MainActivity.java) - 源代码

## 🤝 贡献

### 代码风格
- 使用标准 Java 命名规范
- 代码注释使用中文
- 保持简洁，避免过度抽象

### 提交前检查
```bash
# 构建测试
./gradlew.bat assembleRelease

# 验证 APK 大小
ls -lh app/build/outputs/apk/release/app-release.apk

# 安装测试
adb install -r app/build/outputs/apk/release/app-release.apk
```

## 📄 许可证

根据主仓库许可证。

## 🔗 链接

- **网站**: https://maomaochongmiao.600318.xyz/
- **主仓库**: `D:\document\html\猫猫虫仓库有后台`
- **APP 目录**: `D:\document\html\猫猫虫仓库有后台\android-app`

---

**注意**: 这是第一步的交付成果。第二步将集成到网站并提供下载入口。
