#!/usr/bin/env bash

# 猫猫虫仓库 Android 下载链路验证脚本
# 用途：验证第二步完成后的下载链路是否正常工作

echo "========================================"
echo "猫猫虫仓库 Android 下载链路验证"
echo "========================================"
echo ""

BASE_URL="https://maomaochongmiao.600318.xyz"
EXPECTED_SIZE=18413
EXPECTED_SHA256="a6e6cd4ea643f5a6c60d97382b03df589f02b2a5107688539577ea316e7c6c9d"

# 测试计数
TESTS_PASSED=0
TESTS_FAILED=0

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_test() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "[1/5] 测试元数据 JSON 访问..."
METADATA_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/downloads/maomaochong-android/latest.json")
METADATA_CODE=$(echo "$METADATA_RESPONSE" | tail -1)
METADATA_BODY=$(echo "$METADATA_RESPONSE" | sed '$d')

if [ "$METADATA_CODE" = "200" ]; then
    pass_test "元数据 JSON 可访问 (HTTP 200)"

    # 检查 JSON 内容
    if echo "$METADATA_BODY" | grep -q "maomaochong-android"; then
        pass_test "元数据包含正确的项目 ID"
    else
        fail_test "元数据项目 ID 不正确"
    fi

    if echo "$METADATA_BODY" | grep -q "1.0.0"; then
        pass_test "元数据包含正确的版本号"
    else
        fail_test "元数据版本号不正确"
    fi
else
    fail_test "元数据 JSON 访问失败 (HTTP $METADATA_CODE)"
fi
echo ""

echo "[2/5] 测试 latest APK 下载..."
LATEST_RESPONSE=$(curl -s -w "\n%{http_code}\n%{size_download}" -o /tmp/mmc-android-test.apk "${BASE_URL}/downloads/maomaochong-android/latest.apk")
LATEST_CODE=$(echo "$LATEST_RESPONSE" | sed -n '2p')
LATEST_SIZE=$(echo "$LATEST_RESPONSE" | sed -n '3p')

if [ "$LATEST_CODE" = "200" ]; then
    pass_test "latest APK 可下载 (HTTP 200)"

    if [ "$LATEST_SIZE" = "$EXPECTED_SIZE" ]; then
        pass_test "APK 大小正确 ($LATEST_SIZE 字节)"
    else
        fail_test "APK 大小不匹配 (期望: $EXPECTED_SIZE, 实际: $LATEST_SIZE)"
    fi
else
    fail_test "latest APK 下载失败 (HTTP $LATEST_CODE)"
fi
echo ""

echo "[3/5] 测试版本化 APK 下载..."
VERSIONED_RESPONSE=$(curl -s -w "\n%{http_code}" -o /dev/null "${BASE_URL}/downloads/maomaochong-android/v1.0.0.apk")
VERSIONED_CODE=$(echo "$VERSIONED_RESPONSE" | tail -1)

if [ "$VERSIONED_CODE" = "200" ]; then
    pass_test "版本化 APK 可下载 (HTTP 200)"
else
    fail_test "版本化 APK 下载失败 (HTTP $VERSIONED_CODE)"
fi
echo ""

echo "[4/5] 验证 APK SHA256..."
if [ -f /tmp/mmc-android-test.apk ]; then
    if command -v sha256sum &> /dev/null; then
        ACTUAL_SHA256=$(sha256sum /tmp/mmc-android-test.apk | awk '{print $1}')
        if [ "$ACTUAL_SHA256" = "$EXPECTED_SHA256" ]; then
            pass_test "SHA256 匹配"
            info "SHA256: $ACTUAL_SHA256"
        else
            fail_test "SHA256 不匹配"
            echo "  期望: $EXPECTED_SHA256"
            echo "  实际: $ACTUAL_SHA256"
        fi
    else
        info "sha256sum 不可用，跳过 SHA256 验证"
    fi
else
    fail_test "APK 文件不存在，无法验证 SHA256"
fi
echo ""

echo "[5/5] 测试软件更新 API..."
API_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/software-updates/maomaochong-android")
API_CODE=$(echo "$API_RESPONSE" | tail -1)
API_BODY=$(echo "$API_RESPONSE" | sed '$d')

if [ "$API_CODE" = "200" ]; then
    pass_test "软件更新 API 可访问 (HTTP 200)"

    if echo "$API_BODY" | grep -q "maomaochong-android"; then
        pass_test "API 返回正确的项目信息"
    else
        fail_test "API 返回的项目信息不正确"
    fi

    if echo "$API_BODY" | grep -q "apk"; then
        pass_test "API 包含 APK 下载类型"
    else
        fail_test "API 不包含 APK 下载类型"
    fi
else
    fail_test "软件更新 API 访问失败 (HTTP $API_CODE)"
fi
echo ""

# 清理
rm -f /tmp/mmc-android-test.apk

# 总结
echo "========================================"
echo "验证完成"
echo "========================================"
echo -e "通过: ${GREEN}${TESTS_PASSED}${NC} 个测试"
echo -e "失败: ${RED}${TESTS_FAILED}${NC} 个测试"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！下载链路工作正常。${NC}"
    exit 0
else
    echo -e "${RED}✗ 有测试失败，请检查配置。${NC}"
    exit 1
fi
