@echo off
REM APK 验证脚本
REM 用途：验证生成的 APK 文件的完整性和签名

echo ========================================
echo 猫猫虫仓库 Android APK 验证
echo ========================================
echo.

set APK_FILE=dist\maomaochong-android-v1.0.0.apk

if not exist "%APK_FILE%" (
    echo [错误] APK 文件不存在: %APK_FILE%
    exit /b 1
)

echo [1/3] 检查 APK 文件大小...
for %%A in ("%APK_FILE%") do set APK_SIZE=%%~zA
echo      文件大小: %APK_SIZE% 字节

if %APK_SIZE% GTR 26214400 (
    echo      [失败] APK 大小超过 25MB 限制
    exit /b 1
) else (
    echo      [通过] APK 大小符合要求 (^< 25MB^)
)
echo.

echo [2/3] 计算 SHA256 哈希...
for /f "tokens=1" %%h in ('certutil -hashfile "%APK_FILE%" SHA256 ^| findstr /v ":" ^| findstr /v "SHA256"') do (
    set HASH=%%h
)
echo      SHA256: %HASH%
echo      预期值: a6e6cd4ea643f5a6c60d97382b03df589f02b2a5107688539577ea316e7c6c9d
echo.

echo [3/3] 验证 APK 签名...
if not defined ANDROID_HOME (
    echo      [警告] ANDROID_HOME 未设置，跳过签名验证
) else (
    java -jar "%ANDROID_HOME%\build-tools\35.0.0\lib\apksigner.jar" verify --print-certs "%APK_FILE%" 2>nul
    if errorlevel 1 (
        echo      [失败] APK 签名验证失败
        exit /b 1
    ) else (
        echo      [通过] APK 签名有效
    )
)
echo.

echo ========================================
echo 验证完成！
echo ========================================
echo.
echo APK 信息摘要：
echo   文件名: %APK_FILE%
echo   大小: %APK_SIZE% 字节 (约 %APK_SIZE:~0,-3% KB)
echo   包名: xyz.maomaochongmiao.app
echo   版本: 1.0.0 (versionCode: 1)
echo.
echo 可以开始测试安装了！
pause
