import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'artifacts', 'capoo-message', 'font-sources');
const OUTPUT_DIR = path.join(ROOT, 'public', 'tools', 'capoo-message-sticker', 'assets', 'fonts');
const MANIFEST_PATH = path.join(SOURCE_DIR, 'font-build-manifest.json');
const NOTO_COMMIT = 'f8d157532fbfaeda587e826d4cd5b21a49186f7c';
const GOOGLE_FONTS_COMMIT = '2f6daa88e1e71320a6fe71cc91ecbfc018928737';
const UNICODE_RANGES = 'U+0000-024F,U+2000-206F,U+2E80-2FFF,U+3000-312F,U+31A0-31BF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FE10-FE6F,U+FF00-FFEF';

const fonts = [
  {
    id: 'noto-sans-sc',
    label: '思源黑体',
    family: 'MMC Noto Sans SC',
    sample: '咖波今天也很可爱',
    description: '清晰耐读，适合长文字',
    weight: 700,
    sizeScale: 1,
    sourceName: 'NotoSansSC-VF.ttf',
    sourceUrl: `https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_COMMIT}/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf`,
    sourceSha256: 'd68bafcb48a2707749396aa12bbbd833cb70401f3a9a689fd2902c7e0d295964',
    outputName: 'NotoSansSC-VariableFont_wght.woff2',
    licenseName: 'NotoSansSC-OFL.txt',
    licenseSourceName: 'NotoSans-OFL.txt',
    licenseUrl: `https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_COMMIT}/Sans/LICENSE`,
    licenseSha256: '6a73f9541c2de74158c0e7cf6b0a58ef774f5a780bf191f2d7ec9cc53efe2bf2',
    commit: NOTO_COMMIT
  },
  {
    id: 'noto-serif-sc',
    label: '思源宋体',
    family: 'MMC Noto Serif SC',
    sample: '祝你今天万事顺意',
    description: '端正温和，适合通知祝福',
    weight: 700,
    sizeScale: 1,
    sourceName: 'NotoSerifSC-VF.ttf',
    sourceUrl: `https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_COMMIT}/Serif/Variable/TTF/Subset/NotoSerifSC-VF.ttf`,
    sourceSha256: '5326cfb097e3ab26fcb39329752b5c0a439bf8d5c4649520e4b492939c352a09',
    outputName: 'NotoSerifSC-VariableFont_wght.woff2',
    licenseName: 'NotoSerifSC-OFL.txt',
    licenseSourceName: 'NotoSerif-OFL.txt',
    licenseUrl: `https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_COMMIT}/Serif/LICENSE`,
    licenseSha256: '6a73f9541c2de74158c0e7cf6b0a58ef774f5a780bf191f2d7ec9cc53efe2bf2',
    commit: NOTO_COMMIT
  },
  {
    id: 'zcool-kuaile',
    label: '站酷快乐体',
    family: 'MMC ZCOOL KuaiLe',
    sample: '咖波今天超开心',
    description: '活泼圆润，适合可爱短句',
    weight: 400,
    sizeScale: 1,
    sourceName: 'ZCOOLKuaiLe-Regular.ttf',
    sourceUrl: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf`,
    sourceSha256: '812a6fc1fe54b6d73a419245c32dfeba8aa33104d5be90d1cf6af082007cb71d',
    outputName: 'ZCOOLKuaiLe-Regular.woff2',
    licenseName: 'ZCOOLKuaiLe-OFL.txt',
    licenseSourceName: 'ZCOOLKuaiLe-OFL.txt',
    licenseUrl: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/zcoolkuaile/OFL.txt`,
    licenseSha256: '538078469839b4a2e7ad22bef4ebe41681a4e53749bb2a072144024f1d6d703d',
    commit: GOOGLE_FONTS_COMMIT
  },
  {
    id: 'ma-shan-zheng',
    label: '马善政毛笔楷书',
    family: 'MMC Ma Shan Zheng',
    sample: '好事正在发生',
    description: '毛笔手写感，适合情绪短句',
    weight: 400,
    sizeScale: 1,
    sourceName: 'MaShanZheng-Regular.ttf',
    sourceUrl: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/mashanzheng/MaShanZheng-Regular.ttf`,
    sourceSha256: 'b844c59bf20bf530e41c20d6ff12b383b23a2e553b9b68cc89f070869213155d',
    outputName: 'MaShanZheng-Regular.woff2',
    licenseName: 'MaShanZheng-OFL.txt',
    licenseSourceName: 'MaShanZheng-OFL.txt',
    licenseUrl: `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/ofl/mashanzheng/OFL.txt`,
    licenseSha256: 'd7bdb1cee215b689e23c2f95672a6084c790542170648267a55114103d756a08',
    commit: GOOGLE_FONTS_COMMIT
  }
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function fetchPinned(url, target, expectedHash) {
  let body;
  try {
    body = await readFile(target);
  } catch {
    body = null;
  }
  if (!body || sha256(body) !== expectedHash) {
    const response = await fetch(url, { signal: AbortSignal.timeout(240_000) });
    if (!response.ok) throw new Error(`下载失败 ${response.status}: ${url}`);
    body = Buffer.from(await response.arrayBuffer());
    await writeFile(target, body);
  }
  const actualHash = sha256(body);
  if (actualHash !== expectedHash) throw new Error(`源文件 SHA-256 不匹配：${path.basename(target)} ${actualHash}`);
  return { bytes: body.length, sha256: actualHash };
}

function subsetFont(source, output) {
  const args = [
    source,
    `--output-file=${output}`,
    '--flavor=woff2',
    `--unicodes=${UNICODE_RANGES}`,
    '--layout-features=*',
    '--no-hinting',
    '--name-IDs=*',
    '--name-legacy',
    '--name-languages=*'
  ];
  const result = spawnSync('pyftsubset', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`pyftsubset 失败：${result.stderr || result.stdout}`);
  return `pyftsubset ${path.basename(source)} --flavor=woff2 --unicodes=${UNICODE_RANGES} --layout-features=* --no-hinting --name-IDs=* --name-legacy --name-languages=*`;
}

async function main() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  const built = [];
  for (const font of fonts) {
    const sourcePath = path.join(SOURCE_DIR, font.sourceName);
    const licenseSourcePath = path.join(SOURCE_DIR, font.licenseSourceName);
    const source = await fetchPinned(font.sourceUrl, sourcePath, font.sourceSha256);
    const license = await fetchPinned(font.licenseUrl, licenseSourcePath, font.licenseSha256);
    const outputPath = path.join(OUTPUT_DIR, font.outputName);
    const command = subsetFont(sourcePath, outputPath);
    await copyFile(licenseSourcePath, path.join(OUTPUT_DIR, font.licenseName));
    const output = await readFile(outputPath);
    built.push({
      ...font,
      src: `assets/fonts/${font.outputName}`,
      source,
      output: { bytes: output.length, sha256: sha256(output) },
      license: { bytes: license.bytes, sha256: license.sha256 },
      command
    });
    console.log(`${font.label}: ${source.bytes} -> ${output.length} bytes, ${sha256(output)}`);
  }

  const registry = {
    version: 1,
    defaultId: 'noto-sans-sc',
    fallbackId: 'noto-sans-sc',
    fonts: built.map(font => ({
      id: font.id,
      label: font.label,
      family: font.family,
      src: font.src,
      weight: font.weight,
      sizeScale: font.sizeScale,
      sample: font.sample,
      description: font.description
    }))
  };
  await writeFile(path.join(OUTPUT_DIR, 'fonts.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  await writeFile(MANIFEST_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    unicodeRanges: UNICODE_RANGES,
    notoCommit: NOTO_COMMIT,
    googleFontsCommit: GOOGLE_FONTS_COMMIT,
    fonts: built
  }, null, 2)}\n`, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
