# YiGo-Ai导航 数据抓取总结

## 一、抓取总览

| 项目 | 数据 |
|---|---|
| 目标网站 | https://ai.codefather.cn/tool |
| 工具总数 | 1,789 |
| 分类数 | 14 |
| 成功获取真实URL | 1,667 (93%) |
| 成功获取详细介绍 | 1,287 (72%) |
| 总耗时 | 约 30 分钟 |

## 二、抓取流程

```
第1层: 分类列表页 → 提取所有工具ID和名称
   ↓  (49个页面, 14个分类)
第2层: 工具详情页 → 提取真实官网URL + 详细介绍
   ↓  (1,789个页面)
第3层: 数据合并 → 生成 db.json → 构建部署
```

### 步骤详解

1. **爬取分类列表页** (`scrape_complete.cjs`)
   - URL格式: `/tool/all/{分类名}?current={页码}&pageSize=50&tag={分类名}`
   - 从HTML中提取工具卡片（`<h5>`=工具名, `<sub>`=描述, `href="/tool/ID"`=工具ID）
   - 输出: 按4级嵌套结构的 `scripts/db_all.mjs`

2. **爬取工具详情页** (`fetch_urls.cjs`)
   - URL格式: `https://ai.codefather.cn/tool/{ID}`
   - 提取真实外部URL（过滤掉 codefather 域名、图片CDN、站内链接等）
   - 提取详细介绍内容（从第一个 `<h2>` 到"工具推荐"区域前）
   - 分批按分类执行，每类 2-3 分钟

3. **构建部署**
   - `npm run build-start` → 压缩数据
   - 推送 `data/db.json` + 源文件 → GitHub
   - GitHub Actions 自动构建 Angular 项目 → 部署到 gh-pages

## 三、踩坑记录

### 坑1: 反斜杠污染URL
**现象**: 提取的URL尾部带有 `\\`，导致 `new URL()` 解析失败
**原因**: 正则 `[^\"'<> ]+` 没排除反斜杠 `\`，Next.js RSC 数据流中的转义符被吃进URL
**修复**: 正则改为 `[^\"'<>\s\\\\]+`

### 坑2: `parseInt` 精度丢失
**现象**: codefather 工具ID为 19 位数字（如 `1983423688002134094`），超出 `Number.MAX_SAFE_INTEGER`
**原因**: JavaScript 的 `parseInt` 对大数会丢失精度，所有ID被截断
**修复**: 用字符串存储 ID，不转数字

### 坑3: URL过滤条件写反
**现象**: 370个工具全部找不到真实URL
**原因**: 过滤条件中 `!u.startsWith('http')` 写反，把所有 HTTP 链接都过滤掉了
**修复**: 改成 `u.startsWith('http')`

### 坑4: Angular模板 `Number()` 不可用
**现象**: 构建时报错 `Property 'Number' does not exist`
**原因**: Angular 模板中只能用组件属性和方法，`Number` 等全局对象不可用
**修复**: 改用组件方法 `toNumber(val)`，或在模板中用 `+item.id`

### 坑5: 动态属性用点号访问
**现象**: 构建错误 `Property 'richDesc' comes from an index signature`
**原因**: TypeScript 严格模式下，通过 `[key: string]: any` 定义的动态属性必须用方括号访问
**修复**: `tool['richDesc']` 替代 `tool.richDesc`

### 坑6: 嵌套箭头函数括号配对
**现象**: `SyntaxError: missing ) after argument list`
**原因**: 4层 `forEach` 嵌套用箭头简写 `c=>c.nav.forEach(s=>s.nav.forEach(...))`，括号数极易出错
**修复**: 改用 `function()` 传统写法

### 坑7: codefather ID 被覆盖丢失
**现象**: 第一次抓取真实URL后替换了原URL，第二次需要抓取详细介绍时找不到 codefather ID
**原因**: 没有保留 codefather 原始ID（`cfId`字段），URL被覆盖后无法重建详情页链接
**修复**: 在第一次抓取时保留 `cfId` 字段，所有操作基于 `cfId` 而非URL

### 坑8: 分步处理覆盖数据
**现象**: 多次 `scrape_complete.cjs` 和 `fetch_urls.cjs` 交替执行互相覆盖
**原因**: 两个脚本都写入 `data/db.json`，后执行的覆盖前者结果
**修复**: 分离数据流 - `scrape_complete` 只生成源数据，`fetch_urls` 只更新URL和介绍，不互相覆盖

## 四、可改进的点

1. **重试机制**: 对失败的请求自动重试（目前只跑一次）
2. **增量更新**: 只处理新增或变更的工具，避免全量重新抓取
3. **并发控制**: 限制并发数避免被限流（目前串行 + 200ms延迟）
4. **详情内容HTML清洗**: 更彻底地清理无用标签和样式
5. **失败自动补抓**: 构建前检查数据完整性，自动补抓缺失项
