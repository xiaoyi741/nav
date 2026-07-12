// SEO 优化脚本：生成 sitemap.xml + 预渲染详情页
const fs = require('fs')
const path = require('path')
const distDir = 'dist'
const baseUrl = 'http://nav.yigoai.cn'

const db = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'))
const skills = JSON.parse(fs.readFileSync('data/skills.json', 'utf-8'))
const prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf-8'))
const news = JSON.parse(fs.readFileSync('data/news.json', 'utf-8'))
const mcp = JSON.parse(fs.readFileSync('data/mcp.json', 'utf-8'))
const learning = JSON.parse(fs.readFileSync('data/learning.json', 'utf-8'))

const tools = []
db.forEach(c => { c.nav.forEach(s => { s.nav.forEach(g => { g.nav.forEach(t => { tools.push(t) }) }) }) })

// ============================================================
// 1. 生成 sitemap.xml
// ============================================================
var urls = ''
function addUrl(loc, priority, changefreq) {
  urls += '<url><loc>' + baseUrl + loc + '</loc><priority>' + priority + '</priority><changefreq>' + changefreq + '</changefreq></url>\n'
}

addUrl('/', '0.8', 'daily')
addUrl('/skills', '0.7', 'weekly')
addUrl('/prompts', '0.7', 'weekly')
addUrl('/news', '0.7', 'daily')
addUrl('/mcp', '0.7', 'weekly')
addUrl('/learning', '0.7', 'weekly')
addUrl('/knowledge', '0.6', 'weekly')

tools.forEach(t => addUrl('/detail/' + t.id, '0.6', 'weekly'))
skills.forEach(s => addUrl('/skills/' + s.id, '0.5', 'monthly'))
prompts.forEach(p => addUrl('/prompts/' + p.id, '0.5', 'monthly'))
news.forEach(n => addUrl('/news/' + n.id, '0.5', 'monthly'))
mcp.forEach(m => addUrl('/mcp/' + m.id, '0.5', 'monthly'))
learning.forEach(l => addUrl('/learning/' + l.id, '0.5', 'monthly'))

var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>'
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8')
console.log('✅ sitemap.xml 已生成 (URL数: ' + (urls.split('\n').length - 1) + ')')

// ============================================================
// 2. 预渲染详情页
// ============================================================
var spaHtml = ''
try { spaHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8') } catch(e) {
  spaHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="/nav/"></head><body></body></html>'
}

function escapeHtml(str) { return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function stripTags(str) { return (str || '').replace(/<[^>]*>/g, '') }

// 生成长尾关键词
function genKeywords(type, name, desc, tags) {
  var kw = ['AI导航', 'YiGo-Ai导航', 'AI工具导航', '人工智能']
  var words = (desc || '').substring(0, 60).split(/[，,。.、\s]+/).filter(w => w.length > 1).slice(0, 5)
  kw = kw.concat(words)
  if (tags && tags.length) kw = kw.concat(tags)
  if (name) kw.push(name)
  if (type === 'skills') kw.push('Agent Skill', 'AI Skill', 'Claude Skill', 'AI编程技能', name + ' Skill')
  if (type === 'prompts') kw.push('AI提示词', 'Prompt模板', 'AI提示词工程', 'ChatGPT提示词', name)
  if (type === 'news') kw.push('AI资讯', '人工智能新闻', 'AI行业动态', 'AI最新消息', name)
  if (type === 'mcp') kw.push('MCP服务器', 'MCP协议', 'AI工具集成', 'Model Context Protocol', name)
  if (type === 'learning') kw.push('AI学习', '人工智能知识', '机器学习教程', '深度学习入门', name)
  if (type === 'detail') kw.push('AI工具', 'AI导航', '人工智能工具', name)
  return [...new Set(kw)].filter(w => w.length > 1).join(',')
}

function preRender(items, type, idField, nameField, descField, tagsField) {
  var count = 0
  var detailDir = path.join(distDir, type)
  if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true })

  items.forEach(function(item) {
    var id = item[idField || 'id']
    var name = escapeHtml(item[nameField || 'name'] || '')
    var desc = escapeHtml(stripTags(item[descField || 'description'] || '').substring(0, 200))
    var tags = item[tagsField || 'tags'] || []
    var pageTitle = name + ' - YiGo-Ai导航'
    var pageUrl = baseUrl + '/' + type + '/' + id
    var keywords = genKeywords(type, name, item.description || item.desc, tags)

    var metaHtml = '<meta name="keywords" content="' + keywords + '" />\n'
      + '<meta property="og:title" content="' + pageTitle + '" />\n'
      + '<meta property="og:description" content="' + desc + '" />\n'
      + '<meta property="og:image" content="' + baseUrl + '/assets/logo.png" />\n'
      + '<meta property="og:url" content="' + pageUrl + '" />\n'
      + '<meta property="og:type" content="website" />\n'
      + '<meta property="og:site_name" content="YiGo-Ai导航" />\n'
      + '<meta name="twitter:card" content="summary_large_image" />\n'
      + '<meta name="twitter:title" content="' + pageTitle + '" />\n'
      + '<meta name="twitter:description" content="' + desc + '" />\n'
      + '<meta name="twitter:image" content="' + baseUrl + '/assets/logo.png" />\n'
      + '<link rel="canonical" href="' + pageUrl + '" />\n'

    var html = spaHtml
      .replace(/<title>[^<]*<\/title>/, '<title>' + pageTitle + '</title>')
      .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + desc + '" />')
      .replace(/<meta name="keywords"[^>]*>/, '')
      .replace('</head>', metaHtml + '</head>')

    var pageDir = path.join(detailDir, String(id))
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true })
    fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8')
    count++
  })
  return count
}

var total = 0
total += preRender(tools, 'detail', 'id', 'name', 'desc', 'tags')
total += preRender(skills, 'skills', 'id', 'name', 'description', 'tags')
total += preRender(prompts, 'prompts', 'id', 'title', 'description', 'tags')
total += preRender(news, 'news', 'id', 'title', 'description', 'tags')
total += preRender(mcp, 'mcp', 'id', 'name', 'description', 'tags')
total += preRender(learning, 'learning', 'id', 'title', 'description', 'tags')

console.log('✅ 预渲染页面完成: ' + total + ' 个页面')

// ============================================================
// 3. 预渲染列表页（生成静态 HTML，让百度能抓取内容）
// ============================================================
function preRenderList(listPages) {
  var count = 0
  listPages.forEach(function(page) {
    var pagePath = page.path
    var title = escapeHtml(page.title + ' - YiGo-Ai导航')
    var desc = escapeHtml(page.description)
    var keywords = page.keywords
    var items = page.items || []
    var pageUrl = baseUrl + pagePath

    // 生成列表内容 HTML
    var listHtml = ''
    items.forEach(function(item) {
      var name = escapeHtml(item.name || item.title || '')
      var d = escapeHtml(stripTags((item.description || item.desc || '')).substring(0, 150))
      listHtml += '<div style="margin-bottom:12px;padding:10px;border:1px solid #eee;border-radius:6px">'
        + '<a href="' + baseUrl + '/' + page.type + '/' + item.id + '" style="font-size:15px;font-weight:600;color:#1677ff;text-decoration:none">' + name + '</a>'
        + '<p style="font-size:13px;color:#666;margin:4px 0 0">' + d + '</p></div>\n'
    })

    var metaHtml = '<meta name="keywords" content="' + keywords + '" />\n'
      + '<meta property="og:title" content="' + title + '" />\n'
      + '<meta property="og:description" content="' + desc + '" />\n'
      + '<meta property="og:url" content="' + pageUrl + '" />\n'
      + '<meta property="og:type" content="website" />\n'
      + '<meta property="og:site_name" content="YiGo-Ai导航" />\n'
      + '<meta name="twitter:card" content="summary_large_image" />\n'
      + '<meta name="twitter:title" content="' + title + '" />\n'
      + '<meta name="twitter:description" content="' + desc + '" />\n'
      + '<link rel="canonical" href="' + pageUrl + '" />\n'

    var html = spaHtml
      .replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>')
      .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + desc + '" />')
      .replace(/<meta name="keywords"[^>]*>/, '')
      .replace('</head>', metaHtml + '</head>')
      .replace('</body>', '<div style="max-width:1200px;margin:0 auto;padding:20px;font-family:sans-serif">'
        + '<h1 style="font-size:24px;font-weight:700">' + page.title + '</h1>'
        + '<p style="font-size:14px;color:#666">' + page.description + '</p>'
        + '<div style="margin-top:16px">' + listHtml + '</div>'
        + '<p style="font-size:12px;color:#999;text-align:center;margin-top:20px">共 ' + page.totalCount + ' 条，此为部分内容，完整页面需 JavaScript 加载</p>'
        + '</div>\n</body>')

    var filePath = path.join(distDir, pagePath.replace(/^\//, ''), 'index.html')
    var dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, html, 'utf-8')
    count++
  })
  return count
}

var listPages = [
  { path: '/skills', title: 'Skills 合集', description: '发现全球 Agent Skills，释放 AI 执行潜力', type: 'skills', keywords: 'Skills,Agent Skill,AI Skill,Claude Skill,AI编程技能,AI导航', totalCount: skills.length, items: skills.slice(0, 40) },
  { path: '/prompts', title: 'AI提示词', description: '一句好提示，搞定AI - 精选 AI 提示词模板', type: 'prompts', keywords: 'AI提示词,Prompt模板,AI提示词工程,ChatGPT提示词,AI导航', totalCount: prompts.length, items: prompts.slice(0, 40) },
  { path: '/news', title: 'AI资讯', description: '精选 AI 行业最新动态和资讯', type: 'news', keywords: 'AI资讯,人工智能新闻,AI行业动态,AI最新消息,AI导航', totalCount: news.length, items: news.slice(0, 40) },
  { path: '/mcp', title: 'MCP 服务器', description: '发现全球好用的 MCP 服务器，重塑你的 AI 工作流', type: 'mcp', keywords: 'MCP服务器,MCP协议,AI工具集成,Model Context Protocol,AI导航', totalCount: mcp.length, items: mcp.slice(0, 40) },
  { path: '/learning', title: 'AI学习资源', description: 'AI 知识百科，深入浅出学习人工智能', type: 'learning', keywords: 'AI学习,人工智能知识,机器学习教程,深度学习入门,AI导航', totalCount: learning.length, items: learning.slice(0, 40) },
]

var listCount = preRenderList(listPages)
console.log('✅ 列表页预渲染完成: ' + listCount + ' 个页面')
console.log('📊 总计: ' + (total + listCount) + ' 个静态页面')