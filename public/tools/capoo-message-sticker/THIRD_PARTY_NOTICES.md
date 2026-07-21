# Third-Party Notices

## Capoo message sticker artwork

- Source: https://store.line.me/stickershop/product/16897/zh-Hant
- Product: `16897`, sticker IDs `293948094` through `293948117`
- Author shown by LINE STORE: Yara
- Local files: `assets/templates/*/base.png` and `assets/templates/*/reference-default.png`
- Notice: character and artwork rights remain with Yara and the applicable rightsholders. These images are not relicensed under this repository's MIT License.

## Noto Sans SC

- Upstream: https://github.com/notofonts/noto-cjk
- Fixed commit: `f8d157532fbfaeda587e826d4cd5b21a49186f7c`
- Source file: `Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf`
- Source SHA-256: `d68bafcb48a2707749396aa12bbbd833cb70401f3a9a689fd2902c7e0d295964`
- Local file: `assets/fonts/NotoSansSC-VariableFont_wght.woff2`
- Local SHA-256: `d3ef39e38407c1a8dd72a5ad904d3e110028620a2de5f7f66c8f31cce3f0b9aa`
- License: SIL Open Font License 1.1, included in `assets/fonts/NotoSansSC-OFL.txt`
- Transformation: `pyftsubset` to WOFF2 with Latin, common punctuation, Bopomofo, CJK Unified Ideographs, CJK compatibility ideographs and fullwidth forms.

## Noto Serif SC

- Upstream: https://github.com/notofonts/noto-cjk
- Fixed commit: `f8d157532fbfaeda587e826d4cd5b21a49186f7c`
- Source file: `Serif/Variable/TTF/Subset/NotoSerifSC-VF.ttf`
- Source SHA-256: `5326cfb097e3ab26fcb39329752b5c0a439bf8d5c4649520e4b492939c352a09`
- Local file: `assets/fonts/NotoSerifSC-VariableFont_wght.woff2`
- Local SHA-256: `dea05dd2e37c7821a1ac665ab83d6ed10b924a5053122cf1ce40353f8f254b19`
- License: SIL Open Font License 1.1, included in `assets/fonts/NotoSerifSC-OFL.txt`
- Transformation: same fixed `pyftsubset` Unicode ranges as Noto Sans SC.

## ZCOOL KuaiLe

- Upstream: https://github.com/google/fonts
- Fixed commit: `2f6daa88e1e71320a6fe71cc91ecbfc018928737`
- Source file: `ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf`
- Source SHA-256: `812a6fc1fe54b6d73a419245c32dfeba8aa33104d5be90d1cf6af082007cb71d`
- Local file: `assets/fonts/ZCOOLKuaiLe-Regular.woff2`
- Local SHA-256: `f074d50eb2a3626f065d6015fc6808807f0600685cedab5a18b0ed20b74f06e8`
- License: SIL Open Font License 1.1, included in `assets/fonts/ZCOOLKuaiLe-OFL.txt`
- Transformation: same fixed `pyftsubset` Unicode ranges as the Noto fonts.

## Ma Shan Zheng

- Upstream: https://github.com/google/fonts
- Fixed commit: `2f6daa88e1e71320a6fe71cc91ecbfc018928737`
- Source file: `ofl/mashanzheng/MaShanZheng-Regular.ttf`
- Source SHA-256: `b844c59bf20bf530e41c20d6ff12b383b23a2e553b9b68cc89f070869213155d`
- Local file: `assets/fonts/MaShanZheng-Regular.woff2`
- Local SHA-256: `24b31701b31309ea43fadcf7ad17bec48dbe4d49dd6f2bf56401430dd498fd23`
- License: SIL Open Font License 1.1, included in `assets/fonts/MaShanZheng-OFL.txt`
- Transformation: same fixed `pyftsubset` Unicode ranges as the Noto fonts.

## fflate

- Version: `0.8.3`
- Upstream: https://github.com/101arrowz/fflate
- npm: https://www.npmjs.com/package/fflate/v/0.8.3
- Local file: `vendor/fflate.min.js`
- Local SHA-256: `462ef8041fc970e3615a20a9dd2b2e3047a073b2da729ef4f02b634bba8b7b83`
- License: MIT, included in `vendor/fflate-LICENSE.txt`

## gifenc

- Version: `1.0.3`
- Upstream: https://github.com/mattdesl/gifenc
- npm: https://www.npmjs.com/package/gifenc/v/1.0.3
- npm integrity: `sha512-xdr6AdrfGBcfzncONUOlXMBuc5wJDtOueE3c5rdG0oNgtINLD+f2iFZltrBRZYzACRbKr+mSVU/x98zv2u3jmw==`
- Local file: `vendor/gifenc.min.js`
- Local SHA-256: `217761244379253ba5815510d3048a4fb1f4c4dbef9fb51a5cfbfe26f34eec093`
- License: MIT, included in `vendor/gifenc-LICENSE.md`
- Build: local ESM distribution copied from the fixed npm package; no runtime CDN dependency.

## Lucide

- Version: `1.25.0`
- Upstream: https://github.com/lucide-icons/lucide
- npm: https://www.npmjs.com/package/lucide/v/1.25.0
- Local file: `vendor/lucide.min.js`
- Local SHA-256: `89678151bc9de869a48a8b430331073cb359478146b34dc103440f18bf143549`
- License: ISC, included in `vendor/lucide-LICENSE.txt`
