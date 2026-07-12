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