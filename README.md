# YiGo-Ai导航

> AI 工具导航网站 — 发现优质 AI 资源

## 项目信息

- **站点**: https://xiaoyi741.github.io/nav/
- **GitHub**: https://github.com/xiaoyi741/nav
- **技术栈**: Angular 18 + TypeScript + NG-ZORRO + Tailwind CSS
- **数据源**: [鱼皮AI导航](https://ai.codefather.cn/tool)
- **数据量**: 1,789 个 AI 工具，14 个分类

## 快速本地开发

```bash
# 克隆
git clone https://github.com/xiaoyi741/nav.git
cd nav

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm start

# 构建
npm run build-gh-pages
```

## 项目结构

```
nav/
├── data/                    # 数据文件
│   ├── db.json              # 压缩后的工具数据（构建时生成）
│   └── settings.json        # 站点配置（主题、标题、SEO）
├── scripts/                 # 脚本工具
│   ├── scrape_complete.cjs  # 从 codefather 爬取工具列表
│   ├── fetch_urls.cjs       # 爬取每个工具的真实URL和详细介绍
│   ├── seo-generate.cjs     # 生成 sitemap.xml + 预渲染静态HTML
│   ├── merge_cfid.cjs       # 合并 cfId 字段
│   └── refetch_all.cjs      # 补抓缺失数据
├── src/                     # Angular 源码
│   ├── app/                 # 应用主模块
│   ├── view/                # 页面组件
│   │   ├── sim/             # Sim 主题
│   │   ├── side/            # Side 主题（当前默认）
│   │   ├── detail/          # 工具详情页（自定义添加）
│   │   └── system/          # 后台管理
│   ├── components/          # 公共组件
│   ├── store/               # 状态管理
│   └── services/            # 服务
└── .github/workflows/       # CI/CD 配置
```

## 部署流程

1. 推送 `main` 分支 → GitHub Actions 自动构建
2. 构建命令: `npm run build-gh-pages`
3. 生成 SEO 文件: `node scripts/seo-generate.cjs`
4. 部署到 `gh-pages` 分支 → GitHub Pages 自动上线

## SEO 特性

- ✅ 无 Hash 路由 `/detail/1`（非 `/#/detail/1`）
- ✅ 每个详情页独立 `<title>` + meta description
- ✅ Open Graph 标签（社交分享）
- ✅ Twitter Card 标签
- ✅ JSON-LD 结构化数据
- ✅ Sitemap.xml（1,790 个 URL）
- ✅ 预渲染 1,789 个静态 HTML 页面

## 数据更新

```bash
# 1. 重新爬取工具列表
node scripts/scrape_complete.cjs

# 2. 按分类爬取真实URL和详细介绍
node scripts/fetch_urls.cjs "分类名"

# 3. 构建
npm run build-start

# 4. 推送到 GitHub
git push
```
