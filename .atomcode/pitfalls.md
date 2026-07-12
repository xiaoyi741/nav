# YiGo-Ai导航 避坑记忆

## 一、Git 相关

### 1.1 Windows Git 锁文件

**问题：** `fatal: Unable to create '.git/index.lock': File exists.`

**原因：** Git 进程崩溃后，锁文件残留，无法删除。

**解决：**
```bash
# 方法 1：用 cmd 删除
cmd /c "del /f /q S:\path\to\.git\index.lock"

# 方法 2：先杀掉 git 进程
taskkill /f /im git.exe
```

**注意：** `rm -f` 在 Windows 上有时删不掉，必须用 `cmd /c del`。

### 1.2 推送超时

**问题：** `git push` 长时间无响应，最终超时。

**原因：** 网络环境无法直连 GitHub。

**解决：** 配置 SOCKS5 代理再推送。
```bash
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080
git push origin main
```

### 1.3 推送被拒绝

**问题：** `! [remote rejected] main -> main (cannot lock ref 'refs/heads/main')`

**原因：** 远程仓库有更新的提交，本地落后。

**解决：** 先拉取再推送。
```bash
git pull --rebase origin main
git push origin main
```

---

## 二、数据与 ID 相关

### 2.1 大数字 ID 精度丢失

**问题：** 从 `ai.codefather.cn` 抓取的 ID 如 `2014279391814037507` 在 JavaScript 中被截断为 `2014279391814037500`。

**原因：** 这些 ID 超过了 `Number.MAX_SAFE_INTEGER`（9007199254740991），JSON.parse 时精度丢失。

**解决：** 所有 ID 字段必须存为字符串，避免数字解析。
```typescript
interface ISkill {
  id: string  // 不要用 number！
}
```

### 2.2 skills.json 数据混乱

**问题：** 第一次爬取时 ID 被截断，导致大量无效数据（304 条无内容）。

**原因：** 用 `require()` 导入 JSON 时，数字 ID 被自动转为 number，精度丢失。

**解决：** 
1. 原始数据 ID 用字符串保存
2. 如果已损坏，筛选出合法 ID 并删除截断的：
```js
const clean = data.filter(s => String(s.id).length >= 15)
```

---

## 三、CDN 与域名相关

### 3.1 自定义域名被清空

**问题：** GitHub Pages 自定义域名设置突然消失，导致 CDN 返回 404。

**原因：** 对 gh-pages 分支 force push 后，GitHub 有时会重置自定义域名配置。

**解决：** 
1. 在仓库 Settings → Pages 重新设置自定义域名
2. 在 `public/` 目录创建 `CNAME` 文件防止再次丢失：
```
nav.yigoai.cn
```
   > **注意：** 使用 GitHub Actions 部署时，CNAME 文件会被忽略，但仍建议保留作为备份。

### 3.2 HTTPS 证书无法签发

**问题：** Enforce HTTPS 勾选不上，提示域名配置不正确。

**原因：** DNS 指向了 CDN（CNAME 记录），不是 GitHub Pages 的 IP。

**解决：** 临时把 DNS 改为 A 记录指向 GitHub Pages，等 HTTPS 证书签发后再改回 CDN。
```
A 记录  @ → 185.199.108.153
A 记录  @ → 185.199.109.153
A 记录  @ → 185.199.110.153
A 记录  @ → 185.199.111.153
```

### 3.3 CDN 回源路径问题

**问题：** HTML 中 `<base href="/nav/">` 但 CDN 回源时没有加 `/nav/` 路径。

**原因：** CDN 不支持「回源路径」配置，无法自动将 `/` 映射到 `/nav/`。

**解决：** 
- 方案一：项目使用 `/` 作为 base href（当前方案）
- 方案二：CDN 支持 URL 重写的话，配置 `/` → `/nav/` 的映射规则

### 3.4 CDN 缓存导致更新不生效

**问题：** 更新代码并部署后，访问还是旧版本。

**原因：** CDN 缓存了旧资源，没有自动失效。

**解决：** 
- 短期：在 CDN 后台手动刷新缓存
- 长期：配置 CDN 缓存规则，HTML 不缓存或短缓存

---

## 四、项目配置相关

### 4.1 base href 修改后未生效

**问题：** 修改了 `src/main.html` 中的 `<base href="/">`，但部署后还是 `/nav/`。

**原因：** 修改的文件没有推送到 GitHub（git push 超时）。

**解决：** 修改后一定要确认推送成功：
```bash
git push origin main 2>&1 | grep "To https://"
```

### 4.2 页面白屏

**问题：** 页面返回 HTTP 200 但显示空白。

**原因：** 
1. `<base href>` 与实际部署路径不匹配，浏览器找不到 JS 文件
2. main.js 文件太大（23MB），加载超时

**解决：** 
1. 检查 HTML 中 `<base href>` 是否正确
2. 检查 main.js 是否能正常下载

### 4.3 构建脚本不一致

**问题：** 本地开发用 `ng build --configuration production`（输出 `main.html`），CI/CD 用 `npm run build-gh-pages`（输出 `index.html`）。

**原因：** 两个构建命令使用的 index 文件不同。

**解决：** 部署到 gh-pages 时一定要复制正确的文件：
```bash
cp main.html index.html   # 如果用的是 production 构建
cp index.html 404.html
```

---

## 五、Angular 相关

### 5.1 路由参数 `_=Date.now()` 导致 SEO 问题

**问题：** URL 中带有 `_=1783825025134` 时间戳参数，导致搜索引擎看到无限多个重复 URL。

**原因：** 为了强制刷新路由，代码中加入了 `_: Date.now()`。

**解决：** 去掉所有 `_: Date.now()` 参数，URL 保持干净。

### 5.2 OnPush 变更检测导致页面不更新

**问题：** 组件数据更新后，模板没有重新渲染。

**原因：** 使用了 `ChangeDetectionStrategy.OnPush` 但没有调用 `markForCheck()`。

**解决：** 改用默认变更检测策略，或确保所有数据变更后调用 `cdr.markForCheck()`。

### 5.3 构建大小过大

**问题：** main.js 约 23MB，加载慢。

**原因：** 所有数据（skills.json、prompts.json 等）在构建时编译进了 JavaScript 包。

**解决：** 
- 短期：开启 CDN Gzip/Brotli 压缩，传输大小降至约 2MB
- 长期：改为按需加载（API 请求），不在构建时打包数据

---

## 六、爬虫相关

### 6.1 抓取超时

**问题：** 爬虫运行到一半超时（300 秒限制）。

**原因：** 详情页太多，每个页面都需要网络请求。

**解决：** 分批抓取，先抓列表页获取 ID，再分批抓取详情页。
```bash
# 先抓列表页（快）
node scripts/scrape_list.mjs 1 341

# 再分批抓详情页（每批 50 页）
node scripts/scrape_all_skills.mjs 1 50
```

### 6.2 内容提取失败

**问题：** 抓取到的内容为空或只有几个字符。

**原因：** HTML 页面结构复杂，正则匹配不到正确的内容区域。

**解决：** 
- Skills 详情页：在 `Complete terms in LICENSE.txt` 之后开始提取
- 其他页面：在 `🔥热门工具` 之前结束提取
- 先用 `web_fetch` 工具查看页面结构，再写正则

---

## 七、SEO 相关

### 7.1 预渲染页面未生效

**问题：** `seo-generate.cjs` 生成了大量静态页面，但搜索引擎还是抓不到内容。

**原因：** 生成的页面在 `dist/{type}/{id}/index.html`，但搜索引擎可能没有访问这些路径。

**解决：** 确保 `sitemap.xml` 中包含了所有预渲染页面的 URL。

### 7.2 关键词太短

**问题：** 所有页面共用 3 个关键词（AI导航,AI工具,人工智能）。

**原因：** 没有针对不同页面类型生成长尾关键词。

**解决：** 根据页面类型自动生成 8-15 个长尾关键词。

---

## 八、常用命令速查

```bash
# 本地构建
npx ng build --configuration production

# 完整构建（含数据预处理）
npm run build-gh-pages

# 生成 SEO 文件
node scripts/seo-generate.cjs

# 部署到 gh-pages
cd dist
rm -rf .git
cp main.html index.html
cp index.html 404.html
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git remote add origin https://github.com/xiaoyi741/nav.git
git push -f origin gh-pages

# 配置代理
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080
```