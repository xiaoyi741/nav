# YiGo-Ai导航 部署文档

## 项目信息

| 项目 | 值 |
|---|---|
| **站点** | https://xiaoyi741.github.io/nav/ |
| **仓库** | https://github.com/xiaoyi741/nav |
| **GitHub 用户名** | `xiaoyi741` |
| **仓库名** | `nav` |
| **技术栈** | Angular 18 + TypeScript + NG-ZORRO + Tailwind CSS |
| **托管** | GitHub Pages（免费） |
| **CI/CD** | GitHub Actions |

---

## 一、Fork 项目（首次部署）

### 1.1 Fork 仓库

打开 https://github.com/xiaoyi741/nav → 点右上角 **Fork** 按钮

### 1.2 克隆到本地

```bash
git clone https://github.com/你的用户名/nav.git
cd nav
```

### 1.3 修改配置文件

编辑 `nav.config.yaml`，把 `gitRepoUrl` 改为你自己的仓库地址：

```yaml
gitRepoUrl: https://github.com/你的用户名/nav
branch: main
hashMode: false
```

### 1.4 修改站点名称（可选）

编辑 `data/settings.json`：

```json
{
  "theme": "Side",
  "title": "你的站点名称",
  "description": "你的站点描述",
  "keywords": "你的关键词",
  "favicon": "assets/favicon.png"
}
```

---

## 二、配置 GitHub Token（用于后台管理）

### 2.1 生成 Token

1. 打开 https://github.com/settings/tokens/new
2. Name 填 `nav-deploy`
3. 勾选权限: **repo**（全部）、**workflow**
4. 点 **Generate token**，**复制保存好 Token**

### 2.2 配置到仓库 Secrets

1. 打开你的仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点 **New repository secret**
3. Name: `TOKEN`
4. Value: 粘贴刚才复制的 Token
5. 点 **Add secret**

---

## 三、启用 GitHub Pages

1. 打开你的仓库 → **Settings** → **Pages**
2. Source 选择 **GitHub Actions**
3. 不需要手动设置分支，CI 会自动部署到 gh-pages

---

## 四、首次部署（自动触发）

### 4.1 推送代码触发部署

```bash
git add .
git commit -m "初始化部署"
git push origin main
```

### 4.2 查看构建状态

1. 打开你的仓库 → **Actions** 标签页
2. 可以看到 `Build web` 工作流正在运行
3. 等待绿色 ✅ 出现，表示构建成功

### 4.3 访问站点

构建成功后访问：
```
https://你的用户名.github.io/nav/
```

**注意**: 如果使用自定义域名，base-href 需要改为 `/`，并在 `package.json` 中修改：
```json
"build-gh-pages": "npm run setup && ng build --base-href / --index src/index.html"
```

---

## 五、后台管理

### 5.1 进入后台

访问 `https://你的用户名.github.io/nav/system`（注意：无 hash）

### 5.2 登录

1. 点击右上角登录按钮
2. 输入第 2.1 步生成的 GitHub Token
3. 点击登录

### 5.3 后台功能

| 功能 | 说明 |
|---|---|
| **网站管理** | 增删改工具、分类 |
| **标签管理** | 管理分类标签 |
| **系统设置** | 站点名称、描述、SEO 关键词 |
| **搜索管理** | 配置搜索引擎 |
| **书签管理** | 导入导出书签 |

---

## 六、本地开发

### 6.1 环境要求

- Node.js >= 18
- npm >= 9

### 6.2 安装依赖

```bash
git clone https://github.com/你的用户名/nav.git
cd nav
npm install --legacy-peer-deps
```

### 6.3 启动开发服务器

```bash
npm start
# 访问 http://localhost:7001
```

### 6.4 构建生产版本

```bash
npm run build-gh-pages
# 产物在 dist/ 目录
```

---

## 七、数据更新

### 7.1 爬取工具列表

从 ai.codefather.cn 爬取所有分类的工具（约 5 分钟）：

```bash
node scripts/scrape_complete.cjs
```

### 7.2 爬取真实 URL 和详细介绍

按分类分批爬取，每个分类约 2-3 分钟：

```bash
node scripts/fetch_urls.cjs "AI写作"
node scripts/fetch_urls.cjs "AI图像"
node scripts/fetch_urls.cjs "AI视频创作"
node scripts/fetch_urls.cjs "AI办公"
node scripts/fetch_urls.cjs "AI开发平台"
node scripts/fetch_urls.cjs "AI智能体"
node scripts/fetch_urls.cjs "AI聊天对话"
node scripts/fetch_urls.cjs "AI音频音乐"
node scripts/fetch_urls.cjs "AI商业设计"
node scripts/fetch_urls.cjs "AI大模型"
node scripts/fetch_urls.cjs "AI学习平台"
node scripts/fetch_urls.cjs "AI搜索引擎"
node scripts/fetch_urls.cjs "AI内容检测"
node scripts/fetch_urls.cjs "AI应用"
```

### 7.3 补充缺失的详细介绍

```bash
node scripts/fill_descriptions.cjs
```

### 7.4 填充图标

```bash
node scripts/fill_icons.cjs
```

### 7.5 重新构建

```bash
npm run build-start
```

### 7.6 推送上线

```bash
git add data/db.json scripts/db_all.mjs
git commit -m "更新数据"
git push origin main
# GitHub Actions 会自动构建部署
```

---

## 八、SEO 配置

| 功能 | 说明 |
|---|---|
| **路由模式** | 无 Hash 路由（`/detail/1`） |
| **Sitemap** | 自动生成，包含全部 1790 个 URL |
| **预渲染页面** | 每个工具生成独立静态 HTML |
| **OG 标签** | 自动注入 og:title / og:description / og:image |
| **JSON-LD** | 结构化数据，搜索引擎富摘要 |
| **Twitter Card** | 社交分享卡片 |

### 8.1 提交到搜索引擎

```txt
Google Search Console: https://search.google.com/search-console
Bing Webmaster:       https://www.bing.com/webmasters
百度搜索资源平台:      https://ziyuan.baidu.com/

添加站点: https://你的用户名.github.io/nav/
提交 Sitemap: https://你的用户名.github.io/nav/sitemap.xml
```

---

## 九、GitHub Actions CI/CD 说明

### 9.1 工作流文件

`.github/workflows/ci.yml`：

```yaml
name: Build web
on:
  push:
    branches: [main, master, dev, own]
  workflow_dispatch: {}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - run: yarn install --frozen-lockfile
      - run: |
          npm run build-gh-pages
          cp dist/index.html dist/404.html
      - run: node scripts/seo-generate.cjs
        continue-on-error: true
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          branch: gh-pages
          folder: dist
```

### 9.2 手动触发构建

1. 打开仓库 → **Actions** → **Build web**
2. 点 **Run workflow** → 选择 `main` 分支
3. 点 **Run workflow** 开始构建

---

## 十、常见问题

### 10.1 部署失败：git push 错误

**问题**: `failed to push some refs to github.com`
**原因**: gh-pages 分支临时冲突
**解决**: 重新触发工作流即可

### 10.2 部署失败：构建错误

**问题**: `Build web` 工作流标红
**解决**: 
1. 点击工作流查看详细日志
2. 常见原因：TypeScript 类型错误、数据格式问题
3. 本地运行 `npx tsc --noEmit` 检查类型

### 10.3 详情页白屏

**问题**: 访问 `/detail/1` 显示空白
**解决**:
1. 检查 `package.json` 中 `build-gh-pages` 的 `--base-href` 参数
2. GitHub Pages 子路径部署时用 `/nav/`，根域名部署时用 `/`
3. 检查 `dist/404.html` 是否存在（是 index.html 的副本）

### 10.4 图标不显示

**问题**: 工具图标显示为默认首字
**原因**: 目标网站没有标准的 favicon.ico
**解决**: Logo 组件已自动处理，加载失败会回退显示首字

### 10.5 后台无法登录

**问题**: 输入 Token 后登录失败
**解决**:
1. 确认 Token 有 `repo` 权限
2. 检查 `nav.config.yaml` 中 `gitRepoUrl` 是否正确
3. 重新生成 Token 重试

---

## 十一、目录结构

```
nav/
├── .github/workflows/      # CI/CD 配置
│   └── ci.yml
├── .atomcode/
│   └── memory.json         # 项目记忆文件
├── data/                   # 数据文件
│   ├── db.json             # 压缩后的工具数据
│   └── settings.json       # 站点配置
├── scripts/                # 脚本工具
│   ├── scrape_complete.cjs # 爬取工具列表
│   ├── fetch_urls.cjs      # 爬取真实URL+详细介绍
│   ├── fill_descriptions.cjs # 补充描述
│   ├── fill_icons.cjs      # 填充图标
│   ├── seo-generate.cjs    # 生成SEO文件
│   └── refetch_all.cjs     # 补抓数据
├── src/                    # 源码
│   ├── app/                # 主模块
│   ├── view/               # 页面组件
│   │   ├── side/           # Side主题（默认）
│   │   ├── detail/         # 详情页（自定义）
│   │   └── system/         # 后台管理
│   ├── components/         # 公共组件
│   └── store/              # 状态管理
├── nav.config.yaml         # 导航配置
├── package.json            # 构建配置
├── DEPLOY.md               # 本文档
├── README.md               # 项目说明
└── SCRAPING_SUMMARY.md     # 抓取总结
```

---

## 十二、安全提醒

- Token 只在首次配置时需要，用完建议删除
- 不要将 Token 提交到代码仓库
- 定期检查 Token 权限，及时回收不需要的 Token
- 设置仓库为 Private 可以保护数据不被爬取