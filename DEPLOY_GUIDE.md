# YiGo-Ai导航 部署与配置文档

## 站点信息

| 项目 | 值 |
|------|-----|
| **线上地址** | https://nav.yigoai.cn |
| **GitHub 仓库** | https://github.com/xiaoyi741/nav |
| **GitHub Pages** | https://xiaoyi741.github.io/nav/ |
| **技术栈** | Angular 18 + TypeScript + NG-ZORRO + Tailwind CSS |
| **托管** | GitHub Pages + 腾讯云 EdgeOne CDN |
| **CI/CD** | GitHub Actions |

---

## 一、域名与 CDN 配置

### 1.1 DNS 记录

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | `nav` | `nav.yigoai.cn.eo.dnse3.com` |

### 1.2 CDN 配置（腾讯云 EdgeOne）

| 配置项 | 值 |
|-------|-----|
| **加速域名** | `nav.yigoai.cn` |
| **源站地址** | `xiaoyi741.github.io` |
| **回源协议** | `HTTPS` |
| **回源端口** | `443` |
| **回源 HOST** | `nav.yigoai.cn`（使用加速域名） |

### 1.3 CDN 推荐开启的功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 忽略大小写 | ✅ 开 | 避免 URL 大小写问题 |
| 缓存预刷新 | ✅ 开 | 源站更新后 CDN 更快同步 |
| 离线缓存 | ✅ 开 | 源站挂了也不影响已缓存页面 |
| 智能压缩 Gzip | ✅ 开 | 文件变小，加载更快 |
| 智能压缩 Brotli | ✅ 开 | 比 Gzip 压缩率更高 |
| 强制 HTTPS | ✅ 开 | HTTP 自动跳转 HTTPS |
| HTTP/2 回源 | ✅ 开 | 回源更快 |
| HSTS | ✅ 开 | 强制浏览器使用 HTTPS |
| OCSP 装订 | ✅ 开 | 加快 HTTPS 握手 |
| HTTP/2 | ✅ 开 | 提升加载速度 |
| IPv6 访问 | ✅ 开 | 支持 IPv6 用户 |

---

## 二、项目结构

```
nav-local/
├── .atomcode/project.md      # 项目记忆文档
├── data/                     # 数据文件（构建时静态导入）
│   ├── db.json               # 网站导航（AI导航 + 14个子分类）
│   ├── skills.json           # Skills 数据（8169条）
│   ├── prompts.json          # 提示词数据（864条）
│   ├── news.json             # 资讯数据（400条）
│   ├── mcp.json              # MCP 数据（480条）
│   ├── learning.json         # 学习资源数据（172条）
│   ├── knowledge.json        # 知识库内容
│   └── ...
├── public/                   # 静态资源
│   ├── robots.txt            # 爬虫规则
│   └── CNAME                 # 自定义域名（防止被清空）
├── src/
│   ├── app/                  # 根模块、路由
│   ├── components/navbar/    # 全局顶部菜单条（9项）
│   ├── view/                 # 页面组件
│   │   ├── skills/           # Skills 列表/详情
│   │   ├── prompts/          # 提示词 列表/详情
│   │   ├── news/             # 资讯 列表/详情
│   │   ├── mcp/              # MCP 列表/详情
│   │   ├── learning/         # 学习资源 列表/详情
│   │   ├── knowledge/        # 知识库页面
│   │   ├── detail/           # 网站详情页
│   │   └── system/           # 后台管理
│   ├── store/index.ts        # 数据仓库
│   ├── types/                # TypeScript 类型
│   └── services/seo.service.ts  # SEO 服务
└── scripts/                  # 爬虫脚本
    ├── scrape_skills.mjs
    ├── scrape_prompts.mjs
    ├── scrape_news.mjs
    ├── scrape_mcp.mjs
    ├── scrape_learning.mjs
    ├── seo-generate.cjs      # SEO 生成（sitemap + 预渲染）
    └── ...
```

---

## 三、路由表

| 路径 | 类型 | 说明 |
|------|------|------|
| `/` | 主题视图 | 默认主题（Side） |
| `/skills` | 独立页面 | Skills 列表 |
| `/skills/:id` | 独立页面 | Skills 详情 |
| `/prompts` | 独立页面 | 提示词列表 |
| `/prompts/:id` | 独立页面 | 提示词详情 |
| `/news` | 独立页面 | 资讯列表 |
| `/news/:id` | 独立页面 | 资讯详情 |
| `/mcp` | 独立页面 | MCP 列表 |
| `/mcp/:id` | 独立页面 | MCP 详情 |
| `/learning` | 独立页面 | 学习资源列表 |
| `/learning/:id` | 独立页面 | 学习资源详情 |
| `/knowledge` | 独立页面 | AI 知识库 |
| `/system/*` | 后台管理 | 各模块管理 |

---

## 四、部署流程

### 4.1 手动部署

```bash
# 1. 构建
npm run build-gh-pages

# 2. 复制 index.html
cp dist/index.html dist/404.html

# 3. 生成 SEO 文件
node scripts/seo-generate.cjs

# 4. 推送到 gh-pages
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git remote add origin https://github.com/xiaoyi741/nav.git
git push -f origin gh-pages
```

### 4.2 CI/CD 自动部署

推送 `main` 分支 → GitHub Actions 自动构建 → 部署到 `gh-pages`

---

## 五、SEO 配置

| 措施 | 覆盖范围 |
|------|---------|
| **sitemap.xml** | 11,881 个 URL（全部页面类型） |
| **robots.txt** | 允许所有爬虫，指定 sitemap 位置 |
| **动态标题** | 每个页面独立 title |
| **动态描述** | 每个页面独立 description |
| **OG 标签** | og:title / og:description / og:image / og:url |
| **Twitter Card** | twitter:card / title / description / image |
| **Canonical URL** | 防止重复内容 |
| **长尾关键词** | 每个页面自动生成 8-15 个关键词 |
| **预渲染页面** | 11,874 个静态 HTML（含 SPA 脚本） |

### 提交搜索引擎

```txt
Google Search Console: https://search.google.com/search-console
Bing Webmaster:       https://www.bing.com/webmasters
百度搜索资源平台:      https://ziyuan.baidu.com/

添加站点: https://nav.yigoai.cn/
提交 Sitemap: https://nav.yigoai.cn/sitemap.xml
```

---

## 六、数据更新

### 爬取数据

```bash
# Skills
node scripts/scrape_skills.mjs

# 提示词
node scripts/scrape_prompts.mjs

# 资讯
node scripts/scrape_news.mjs

# MCP
node scripts/scrape_mcp.mjs

# 学习资源
node scripts/scrape_learning.mjs
```

### 后台管理

访问 `https://nav.yigoai.cn/system` 登录后管理各模块数据。

---

## 七、注意事项

1. **大数字 ID**：所有 ID 超过 `Number.MAX_SAFE_INTEGER`，必须存为字符串
2. **CDN 缓存**：更新数据后需要在 CDN 后台刷新缓存
3. **自定义域名**：`public/CNAME` 文件可防止域名配置被清空
4. **代理配置**：如需推送代码，配置 `git config --global http.proxy socks5://127.0.0.1:1080`
5. **Bundle 大小**：当前 main.js 约 23MB，因数据在构建时编译进包，后续可考虑动态加载优化