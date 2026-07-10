# YiGo-Ai导航 项目总结

## 项目地址

- **线上站点**：https://xiaoyi741.github.io/nav/
- **GitHub 仓库**：https://github.com/xiaoyi741/nav

---

## 一、功能模块完成情况

| 模块 | 状态 | 路由 | 数据量 | 后台管理 |
|------|------|------|--------|---------|
| AI导航（网址导航） | ✅ 完成 | 主题视图 | 1789 个网站 | ✅ |
| Skills | ✅ 完成 | `/skills` | 8169 条 | ✅ |
| AI提示词 | ✅ 完成 | `/prompts` | 864 条 | ✅ |
| AI资讯 | ✅ 完成 | `/news` | 400 条 | ✅ |
| MCP | ✅ 完成 | `/mcp` | 480 条 | ✅ |
| AI学习资源 | ✅ 完成 | `/learning` | 172 条 | ❌ |
| AI知识库 | ✅ 完成 | `/knowledge` | 单页内容 | ❌ |
| AI工具 | ⏳ 待开发 | — | — | — |
| 开源排行榜 | ⏳ 待开发 | — | — | — |

---

## 二、新增功能清单

### 2.1 全局顶部菜单条
- 9 个分类菜单项，支持 `page` 参数跳转和独立路由两种模式
- 粘性定位，响应式（移动端汉堡菜单）
- 亮/暗主题自适应

### 2.2 Skills 功能
- 列表页：搜索、标签筛选、4列网格、分页（省略号 + 首尾页）
- 详情页：名称、描述、标签、GitHub 链接、安装命令、SKILL.md 内容卡片
- 后台管理：增删改

### 2.3 AI提示词功能
- 列表页：搜索、标签筛选、4列网格、分页
- 详情页：标题、描述、标签、作者、时间、完整提示词内容、一键复制
- 后台管理：增删改

### 2.4 AI资讯功能
- 列表页：搜索、4列网格、分页
- 详情页：标题、描述、作者、时间、阅读数、完整文章、原文链接
- 后台管理：增删改

### 2.5 MCP 功能
- 列表页：搜索、标签筛选、4列网格、分页
- 详情页：名称、描述、标签、GitHub 链接、详细介绍
- 后台管理：增删改

### 2.6 AI学习资源功能
- 列表页：搜索、4列网格、分页
- 详情页：标题、描述、完整百科内容

### 2.7 AI知识库功能
- 单页展示知识库内容（Vibe Coding 教程等）

---

## 三、数据源

所有数据均从 `https://ai.codefather.cn` 抓取：

| 数据 | 来源 | 抓取脚本 |
|------|------|---------|
| Skills | `/skills?current=N` | `scrape_skills.mjs` |
| 提示词 | `/prompt?current=N` | `scrape_prompts.mjs` |
| 资讯 | `/news?current=N` | `scrape_news.mjs` |
| MCP | `/mcp?current=N` | `scrape_mcp.mjs` |
| 学习资源 | `/resource/encyclopedia?current=N` | `scrape_learning.mjs` |
| 知识库 | `/library/{id}` | 手动整理 |

---

## 四、技术要点

### 4.1 数据存储
- 构建时静态导入 JSON 文件（`data/*.json` → `src/store/index.ts`）
- 后台写入通过 `updateFileContent()` 调 GitHub API commit
- 大数字 ID 必须使用字符串类型避免精度丢失

### 4.2 路由设计
- 独立功能模块使用独立路由：`/skills`、`/prompts`、`/news`、`/mcp` 等
- 主题视图分类使用 `?page=N` 参数
- 后台管理在 `/system/*` 路径下

### 4.3 部署
- GitHub Actions CI/CD 自动构建部署
- 手动部署：`npm run build-gh-pages` → 推送 `dist/` 到 `gh-pages` 分支
- 代理配置：`git config --global http.proxy socks5://127.0.0.1:1080`

---

## 五、待办事项

1. **AI工具** 页面开发
2. **开源排行榜** 页面开发
3. 补抓各模块详情内容（运行 `scrape_*.mjs` 脚本）
4. 优化 Skills 搜索功能（支持标签搜索）
5. 数据增量更新机制