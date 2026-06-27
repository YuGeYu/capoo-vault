#!/usr/bin/env node

/**
 * 猫猫虫仓库 Android APK 发布脚本
 *
 * 功能：
 * 1. 验证 APK 文件存在且大小符合要求
 * 2. 计算 SHA256 哈希
 * 3. 生成版本元数据 JSON
 * 4. 上传到 Cloudflare R2
 *
 * 用法：
 *   node scripts/publish-android-apk.mjs --apk ./android-app/dist/maomaochong-android-v1.0.0.apk --version 1.0.0 --version-code 1 [--remote]
 *
 * 参数：
 *   --apk <path>           APK 文件路径
 *   --version <version>    版本号 (versionName)
 *   --version-code <code>  版本代码 (versionCode)
 *   --remote               实际上传到 R2（不加此参数只做本地验证）
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    apk: null,
    version: null,
    versionCode: null,
    remote: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--apk':
        result.apk = args[++i];
        break;
      case '--version':
        result.version = args[++i];
        break;
      case '--version-code':
        result.versionCode = parseInt(args[++i], 10);
        break;
      case '--remote':
        result.remote = true;
        break;
    }
  }

  return result;
}

// 计算文件 SHA256
function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// 主函数
async function main() {
  const args = parseArgs();

  console.log('========================================');
  console.log('猫猫虫仓库 Android APK 发布');
  console.log('========================================\n');

  // 验证参数
  if (!args.apk || !args.version || !args.versionCode) {
    console.error('错误: 缺少必需参数');
    console.error('用法: node publish-android-apk.mjs --apk <path> --version <version> --version-code <code> [--remote]');
    process.exit(1);
  }

  // 1. 检查 APK 文件存在
  console.log('[1/6] 检查 APK 文件...');
  const apkPath = path.resolve(args.apk);
  if (!fs.existsSync(apkPath)) {
    console.error(`错误: APK 文件不存在: ${apkPath}`);
    process.exit(1);
  }
  console.log(`      ✓ 文件存在: ${apkPath}`);

  // 2. 检查文件大小
  console.log('\n[2/6] 检查文件大小...');
  const stats = fs.statSync(apkPath);
  const sizeBytes = stats.size;
  const maxSize = 26214400; // 25 MB

  console.log(`      文件大小: ${formatBytes(sizeBytes)} (${sizeBytes.toLocaleString()} 字节)`);

  if (sizeBytes >= maxSize) {
    console.error(`      ✗ 错误: APK 大小超过 25MB 限制`);
    process.exit(1);
  }
  console.log(`      ✓ 大小符合要求 (< 25MB)`);

  // 3. 计算 SHA256
  console.log('\n[3/6] 计算 SHA256 哈希...');
  const sha256 = calculateSHA256(apkPath);
  console.log(`      SHA256: ${sha256}`);

  // 4. 生成元数据
  console.log('\n[4/6] 生成版本元数据...');
  const fileName = `maomaochong-android-v${args.version}.apk`;
  const metadata = {
    projectId: 'maomaochong-android',
    versionName: args.version,
    versionCode: args.versionCode,
    fileName: fileName,
    sizeBytes: sizeBytes,
    sha256: sha256,
    minAndroid: 'Android 6.0+',
    packageName: 'xyz.maomaochongmiao.app',
    downloadUrl: `/downloads/maomaochong-android/v${args.version}.apk`,
    latestUrl: '/downloads/maomaochong-android/latest.apk',
    publishedAt: new Date().toISOString(),
  };

  const metadataJson = JSON.stringify(metadata, null, 2);
  console.log('      元数据:');
  console.log(metadataJson.split('\n').map(line => '        ' + line).join('\n'));

  // 5. 上传到 R2
  if (args.remote) {
    console.log('\n[5/6] 上传到 Cloudflare R2...');

    const r2Keys = {
      versioned: `downloads/android/maomaochong-android-v${args.version}.apk`,
      latest: 'downloads/android/latest.apk',
      metadata: 'downloads/android/latest.json',
    };

    try {
      // 写入临时元数据文件
      const tempMetadataPath = path.join(process.cwd(), '.tmp-latest.json');
      fs.writeFileSync(tempMetadataPath, metadataJson);

      // 上传版本 APK
      console.log(`      上传: ${r2Keys.versioned}`);
      execSync(
        `wrangler r2 object put mmc-r2/${r2Keys.versioned} --file "${apkPath}" --content-type "application/vnd.android.package-archive" --remote --config wrangler.production.toml`,
        { stdio: 'inherit' }
      );

      // 上传 latest APK
      console.log(`      上传: ${r2Keys.latest}`);
      execSync(
        `wrangler r2 object put mmc-r2/${r2Keys.latest} --file "${apkPath}" --content-type "application/vnd.android.package-archive" --remote --config wrangler.production.toml`,
        { stdio: 'inherit' }
      );

      // 上传元数据
      console.log(`      上传: ${r2Keys.metadata}`);
      execSync(
        `wrangler r2 object put mmc-r2/${r2Keys.metadata} --file "${tempMetadataPath}" --content-type "application/json" --remote --config wrangler.production.toml`,
        { stdio: 'inherit' }
      );

      // 清理临时文件
      fs.unlinkSync(tempMetadataPath);

      console.log('      ✓ 所有文件上传成功');
    } catch (error) {
      console.error('      ✗ 上传失败:', error.message);
      process.exit(1);
    }
  } else {
    console.log('\n[5/6] 跳过上传（--remote 未指定）');
    console.log('      要实际上传，请添加 --remote 参数');
  }

  // 6. 总结
  console.log('\n[6/6] 发布总结');
  console.log('========================================');
  console.log(`项目:         maomaochong-android`);
  console.log(`版本:         ${args.version} (versionCode: ${args.versionCode})`);
  console.log(`文件名:       ${fileName}`);
  console.log(`文件大小:     ${formatBytes(sizeBytes)}`);
  console.log(`SHA256:       ${sha256}`);
  console.log(`包名:         xyz.maomaochongmiao.app`);
  console.log(`最低系统:     Android 6.0+`);

  if (args.remote) {
    console.log('\nR2 对象键:');
    console.log(`  - downloads/android/maomaochong-android-v${args.version}.apk`);
    console.log(`  - downloads/android/latest.apk`);
    console.log(`  - downloads/android/latest.json`);

    console.log('\n下载地址:');
    console.log(`  版本地址: /downloads/maomaochong-android/v${args.version}.apk`);
    console.log(`  最新地址: /downloads/maomaochong-android/latest.apk`);
    console.log(`  元数据:   /downloads/maomaochong-android/latest.json`);
  }

  console.log('\n========================================');
  console.log('✓ 发布流程完成！');
  console.log('========================================\n');

  if (!args.remote) {
    console.log('提示: 这是本地验证，未实际上传。');
    console.log('      要上传到 R2，请重新运行并添加 --remote 参数。\n');
  }
}

main().catch(error => {
  console.error('发布失败:', error);
  process.exit(1);
});
