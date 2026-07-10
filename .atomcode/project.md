# YiGo-Ai导航 项目记忆

## 项目概述

一个基于 Angular 18 + NgZorro Ant Design 的 AI 导航网站。支持 6 种主题视图（Light/Super/Sim/Side/Shortcut/App），数据通过构建时静态 JSON 导入 + GitHub API 写回的方式管理。

## 项目结构

```
nav-local/
├── src/
│   ├── app/              # 根模块、路由
│   │   ├── app.module.ts         # 注册所有组件
│   │   ├── app-routing.module.ts # 路由配置
│   │   ├── app.component.*       # 根组件（含 fetchIng 加载状态）
│   ├── components/       # 公共组件
│   │   ├── navbar/               # 全局顶部菜单条（9项）
│   │   ├── fixbar/               # 右侧浮动工具栏
│   │   ├── card/                 # 网站卡片
│   │   ├── footer/               # 页脚
│   │   ├── search-engine/        # 搜索引擎
│   │   └── ...
│   ├── view/             # 页面组件
│   │   ├── light/                # Light 主题主页
│   │   ├── super/                # Super 主题主页
│   │   ├── sim/                  # Sim 主题主页
│   │   ├── side/                 # Side 主题主页
│   │   ├── shortcut/             # Shortcut 主题主页
│   │   ├── app/default/          # App 主题主页
│   │   ├── skills/               # Skills 功能
│   │   │   ├── list/             # Skills 列表页
│   │   │   └── detail/           # Skills 详情页
│   │   ├── detail/               # 网站详情页
│   │   └── system/               # 后台管理
│   │       ├── web/              # 网址管理
│   │       ├── setting/          # 设置
│   │       ├── skills/           # Skills 管理
│   │       └── ...
│   ├── store/index.ts    # 数据仓库（静态导入 JSON）
│   ├── types/            # TypeScript 类型
│   │   └── skills.ts     # ISkill 类型
│   └── server.mjs        # Express 服务端（API + 静态文件）
├── data/                 # 数据文件（JSON，构建时静态导入）
│   ├── db.json           # 网站导航数据（9个一级分类）
│   ├── skills.json       # Skills 数据
│   └── ...
└── scripts/              # 工具脚本
    └── scrape_skills.mjs # Skills 爬虫
```

## 部署模式

通过 `nav.config.json` 的 `address` 字段判断：

- `address=""` → **GitHub 静态部署**：数据在构建时从 JSON 文件静态导入，写操作通过 `updateFileContent()` 调 GitHub API commit
- `address="xxx"` → **自有部署**：通过 Express 服务器 API 读写本地文件

当前配置 `address=""`，走 GitHub 模式。

## 数据流

```
data/*.json ──模块导入──→ src/store/index.ts (websiteList / skillsList)
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
               各主题视图    Skills页面   后台管理面板
                                          │
                                          ▼
                                  updateFileContent()
                                  → GitHub API / Express API
```

## 顶部菜单条 (navbar)

9 个菜单项定义在 `src/components/navbar/navbar.component.ts`：

| 索引 | 名称 | 类型 |
|------|------|------|
| 0 | AI导航 | page（内容视图分类） |
| 1 | AI工具 | page |
| 2 | AI知识库 | page |
| 3 | AI提示词 | page |
| 4 | MCP | page |
| 5 | Skills | route（独立路由 /skills） |
| 6 | AI学习资源 | page |
| 7 | AI资讯 | page |
| 8 | 开源排行榜 | page |

- `page` 类型：带 ?page=N 参数跳转到当前主题视图
- `route` 类型：直接跳转到独立路由

## Skills 功能

### 路由
- `/skills` → Skills 列表页（搜索 + 标签筛选 + 分页）
- `/skills/:id` → Skills 详情页（名称、描述、标签、安装命令、SKILL.md 内容、相关推荐）
- `/system/skills` → 后台管理（增删改，通过 updateFileContent 写回 data/skills.json）

### 数据字段 (ISkill)
```typescript
interface ISkill {
  id: string | number     // 大数字 ID，需用字符串避免精度丢失！
  name: string            // skill 名称
  description: string     // 中文描述
  content?: string        // SKILL.md 完整内容
  tags: string[]          // 标签
  githubUrl?: string      // GitHub 仓库链接
  installCmd?: string     // 安装命令
  relatedIds?: (string|number)[]  // 相关推荐
  createdAt: string/number
  updatedAt?: string/number
  ownVisible?: boolean
}
```

### 爬虫 (scripts/scrape_skills.mjs)
- 从 `ai.codefather.cn` 抓取 Skills 数据
- 列表页：`/skills?current=N`（每页 20 条，共 341 页 ≈ 6820 个 skill）
- 详情页：`/skills/{id}`（提取 SKILL.md 内容）
- **注意**：ID 是超过 `Number.MAX_SAFE_INTEGER` 的大数字，必须存为**字符串**
- 详情页内容提取策略：在 `Complete terms in LICENSE.txt` 之后开始，到 `🔥热门工具` 之前结束

## 已知问题 / 待办

1. Skills 数据现状：**8169 条**，全部有名称/描述/标签，28 条有完整详情内容
2. 提示词数据：**864 条**，480 条有完整内容
3. 资讯数据：**400 条**，398 条有完整内容
4. MCP 数据：**480 条**，101 条有完整内容
5. AI工具、AI知识库、AI学习资源、开源排行榜 页面待开发
6. 详情内容补抓：运行 `node scripts/backfill_skills.mjs`、`node scripts/scrape_prompts.mjs`、`node scripts/scrape_news.mjs`、`node scripts/scrape_mcp.mjs`
