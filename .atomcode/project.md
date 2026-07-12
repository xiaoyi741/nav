# YiGo-Ai导航 项目记忆

## 项目概述

一个基于 Angular 18 + NgZorro Ant Design 的 AI 导航网站。支持 6 种主题视图（Light/Super/Sim/Side/Shortcut/App），数据通过构建时静态 JSON 导入 + GitHub API 写回的方式管理。

**线上地址：** https://xiaoyi741.github.io/nav/
**仓库地址：** https://github.com/xiaoyi741/nav

## 部署模式

通过 `nav.config.json` 的 `address` 字段判断：

- `address=""` → **GitHub 静态部署**：数据在构建时从 JSON 文件静态导入，写操作通过 `updateFileContent()` 调 GitHub API commit
- `address="xxx"` → **自有部署**：通过 Express 服务器 API 读写本地文件

当前配置 `address=""`，走 GitHub 模式。

## 数据流

```
data/*.json ──模块导入──→ src/store/index.ts
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
               各主题视图    独立页面     后台管理面板
                                          │
                                          ▼
                                  updateFileContent()
                                  → GitHub API / Express API
```

## 项目结构

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
├── src/
│   ├── app/                  # 根模块、路由
│   │   ├── app.module.ts     # 注册所有组件
│   │   ├── app-routing.module.ts  # 路由配置
│   │   └── app.component.*   # 根组件
│   ├── components/           # 公共组件
│   │   └── navbar/           # 全局顶部菜单条（9项）
│   ├── view/                 # 页面组件
│   │   ├── light/super/sim/side/shortcut/app/  # 6种主题视图
│   │   ├── skills/           # Skills 列表/详情
│   │   ├── prompts/          # 提示词 列表/详情
│   │   ├── news/             # 资讯 列表/详情
│   │   ├── mcp/              # MCP 列表/详情
│   │   ├── learning/         # 学习资源 列表/详情
│   │   ├── knowledge/        # 知识库页面
│   │   ├── detail/           # 网站详情页
│   │   └── system/           # 后台管理
│   │       ├── web/          # 网址管理
│   │       ├── skills/       # Skills 管理
│   │       ├── prompts/      # 提示词管理
│   │       ├── news/         # 资讯管理
│   │       ├── mcp/          # MCP 管理
│   │       └── ...
│   ├── store/index.ts        # 数据仓库
│   ├── types/                # TypeScript 类型
│   │   ├── skills.ts
│   │   ├── prompts.ts
│   │   ├── news.ts
│   │   ├── mcp.ts
│   │   └── learning.ts
│   └── server.mjs            # Express 服务端
└── scripts/                  # 爬虫脚本
    ├── scrape_skills.mjs
    ├── scrape_prompts.mjs
    ├── scrape_news.mjs
    ├── scrape_mcp.mjs
    ├── scrape_learning.mjs
    ├── scrape_list.mjs
    ├── backfill_names.mjs
    └── backfill_skills.mjs
```

## 顶部菜单条 (navbar)

9 个菜单项定义在 `src/components/navbar/navbar.component.ts`：

| 索引 | 名称 | 类型 | 路由 |
|------|------|------|------|
| 0 | AI导航 | page | 主题视图分类 |
| 1 | AI工具 | page | 空壳待开发 |
| 2 | AI知识库 | route | `/knowledge` |
| 3 | AI提示词 | route | `/prompts` |
| 4 | MCP | route | `/mcp` |
| 5 | Skills | route | `/skills` |
| 6 | AI学习资源 | route | `/learning` |
| 7 | AI资讯 | route | `/news` |
| 8 | 开源排行榜 | page | 空壳待开发 |

- `page` 类型：带 ?page=N 参数跳转到当前主题视图
- `route` 类型：直接跳转到独立路由

## 各功能模块

### 1. Skills（8169条）
- 路由：`/skills` / `/skills/:id` / `/system/skills`
- 数据：`data/skills.json`
- 爬虫：`scripts/scrape_skills.mjs` / `scrape_all_skills.mjs` / `scrape_list.mjs` / `backfill_names.mjs` / `backfill_skills.mjs`
- 标签：效率工具、软件开发、数据与分析、文档处理等

### 2. AI提示词（864条）
- 路由：`/prompts` / `/prompts/:id` / `/system/prompts`
- 数据：`data/prompts.json`
- 爬虫：`scripts/scrape_prompts.mjs`
- 标签：学习成长、写作、技术、商业、教育学习等

### 3. AI资讯（400条）
- 路由：`/news` / `/news/:id` / `/system/news`
- 数据：`data/news.json`
- 爬虫：`scripts/scrape_news.mjs`

### 4. MCP（480条）
- 路由：`/mcp` / `/mcp/:id` / `/system/mcp`
- 数据：`data/mcp.json`
- 爬虫：`scripts/scrape_mcp.mjs`
- 标签：开发工具、数据库、云平台、安全等

### 5. AI学习资源（172条）
- 路由：`/learning` / `/learning/:id`
- 数据：`data/learning.json`
- 爬虫：`scripts/scrape_learning.mjs`
- 内容：AI 知识百科（机器学习、深度学习、AIGC、LLM等）

### 6. AI知识库
- 路由：`/knowledge`
- 数据：`data/knowledge.json`
- 内容：Vibe Coding 教程、AI 工具测评等（单页内容）

## 爬虫注意事项

- **ID 精度**：所有 ID 都是超过 `Number.MAX_SAFE_INTEGER` 的大数字，必须存为**字符串**
- **内容提取策略**：详情页内容在 `Complete terms in LICENSE.txt` 之后开始，到 `🔥热门工具` 之前结束
- **网络代理**：部分环境需要配置 SOCKS5 代理 `git config --global http.proxy socks5://127.0.0.1:1080`

## 已知问题

1. Skills 有 8169 条 ID，但仅 28 条有完整 SKILL.md 内容
2. 提示词有 864 条，仅 480 条有完整内容
3. 资讯有 400 条，398 条有完整内容
4. MCP 有 480 条，仅 101 条有完整内容
5. AI工具、开源排行榜 页面待开发
6. 详情内容补抓：运行各模块的 `scrape_*.mjs` 脚本
7. **Bundle 过大**：main.js 约 23MB，因数据编译进包，后续可考虑按需加载优化