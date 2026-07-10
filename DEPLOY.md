# YiGo-Ai导航 部署文档

## 一、项目架构

```
用户访问 → GitHub Pages (CDN)
                ↑
          gh-pages 分支 (静态文件)
                ↑
          GitHub Actions (CI/CD)
                ↑
          main 分支 (源码)
```

- **前端框架**: Angular 18 + TypeScript + NG-ZORRO
- **托管**: GitHub Pages（免费，全球 CDN）
- **CI/CD**: GitHub Actions（自动构建部署）
- **数据源**: 从 ai.codefather.cn 爬取 AI 工具数据

---

## 二、部署流程

### 2.1 首次部署

```bash
# 1. 克隆项目
git clone https://github.com/xiaoyi741/nav.git
cd nav

# 2. 安装依赖
npm install --legacy-peer-deps

# 3. 配置 GitHub Pages
# 在仓库 Settings → Pages → Source 选择 "GitHub Actions"

# 4. 推送 main 分支，自动触发部署
git push origin main
```

### 2.2 自动部署（CI/CD）

每次推送 `main` 分支，GitHub Actions 自动执行：

```yaml
# .github/workflows/ci.yml
# 步骤:
#   1. Checkout → 拉取代码
#   2. Setup Node.js 20
#   3. yarn install → 安装依赖
#   4. Build → npm run build-gh-pages
#   5. cp dist/index.html dist/404.html
#   6. Generate SEO → node scripts/seo-generate.cjs
#   7. Deploy → 推送到 gh-pages 分支
```

### 2.3 手动触发部署

```bash
# 在 GitHub 仓库页面:
# Actions → Build web → Run workflow → 选择 main 分支 → 运行

# 或本地构建后手动推送:
npm run build-gh-pages
cp dist/index.html dist/404.html
node scripts/seo-generate.cjs
# 然后将 dist/ 目录内容部署到 gh-pages 分支
```

---

## 三、构建命令详解

```bash
# 完整构建（含数据预处理 + Angular 构建 + SEO 生成）
npm run build-gh-pages

# 仅数据预处理（压缩数据、生成 SEO 模板）
npm run build-start

# 仅 Angular 构建
ng build --base-href /nav/ --index src/index.html

# 生成 SEO 文件（sitemap.xml + 预渲染详情页）
node scripts/seo-generate.cjs
```

### 构建产物

```
dist/
├── index.html          # SPA 入口
├── 404.html            # SPA 副本（GitHub Pages 404 回退）
├── sitemap.xml         # 搜索引擎站点地图
├── *.js / *.css        # Angular 打包文件
├── assets/             # 静态资源
└── detail/{id}/        # 预渲染详情页（SEO 优化）
    └── index.html      # 包含 SPA 脚本的完整页面
```

---

## 四、数据更新流程

### 4.1 爬取工具列表

```bash
# 从 ai.codefather.cn 爬取所有分类的工具列表
node scripts/scrape_complete.cjs
# 输出: scripts/db_all.mjs + data/db.json
```

### 4.2 爬取真实 URL 和详细介绍

```bash
# 按分类分批爬取（每个分类约 2-3 分钟）
node scripts/fetch_urls.cjs "AI写作"
node scripts/fetch_urls.cjs "AI图像"
# ... 14 个分类全部爬取

# 完成后重新构建
npm run build-start
```

### 4.3 补充缺失的详细介绍

```bash
# 为没有详细介绍的工具自动生成结构化描述
node scripts/fill_descriptions.cjs
```

### 4.4 填充图标

```bash
# 为所有工具有效图标（从目标网站获取 favicon.ico）
node scripts/fill_icons.cjs
```

---

## 五、配置文件说明

### 5.1 `nav.config.yaml` — 站点配置

```yaml
gitRepoUrl: https://github.com/xiaoyi741/nav  # 仓库地址
branch: main                                    # 部署分支
hashMode: false                                 # 禁用 Hash 路由
```

### 5.2 `data/settings.json` — 站点设置

```json
{
  "theme": "Side",           # 主题
  "title": "YiGo-Ai导航",    # 站点名称
  "description": "...",      # 站点描述
  "keywords": "...",         # SEO 关键词
  "favicon": "assets/favicon.png",  # 图标
  "language": "zh-CN"        # 语言
}
```

### 5.3 `package.json` — 构建配置

```json
{
  "build-gh-pages": "npm run setup && ng build --base-href /nav/ --index src/index.html"
}
```

> **注意**: `--base-href /nav/` 必须与 GitHub Pages 的子路径一致，否则路由会出错。

---

## 六、SEO 配置

| 功能 | 实现方式 | 说明 |
|---|---|---|
| **无 Hash 路由** | `useHash: false` | URL 格式 `/detail/1` 而非 `/#/detail/1` |
| **Sitemap** | `seo-generate.cjs` | 自动生成，包含 1790 个 URL |
| **预渲染页面** | `seo-generate.cjs` | 每个工具生成独立的静态 HTML |
| **OG 标签** | Angular Meta 服务 | 动态注入 `og:title`、`og:description` 等 |
| **JSON-LD** | 详情页组件 | 结构化数据，搜索引擎富摘要 |

---

## 七、常见问题

### 7.1 部署失败：git push 错误

**现象**: CI 构建成功但部署到 gh-pages 失败
**解决**: 重新触发工作流即可，通常是临时性 git 冲突

### 7.2 详情页刷新后内容丢失

**原因**: 之前预渲染页面有 `meta refresh` 跳转
**修复**: 预渲染页面改用 SPA 模板，保留 Angular 框架脚本

### 7.3 图标不显示

**原因**: favicon.ico 在某些网站不可用
**修复**: Logo 组件已添加 `(error)` 事件处理，加载失败时自动显示首字

### 7.4 国内访问慢

**建议**: 考虑配置自定义域名 + 国内 CDN 加速

---

## 八、技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| Angular | 18 | 前端框架 |
| TypeScript | 5.5 | 开发语言 |
| NG-ZORRO | 18 | UI 组件库 |
| Tailwind CSS | 3.4 | CSS 框架 |
| GitHub Pages | — | 静态托管 |
| GitHub Actions | — | CI/CD |
| Node.js | 20+ | 构建和脚本运行 |