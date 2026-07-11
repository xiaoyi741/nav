// SEO 优化脚本：生成 sitemap.xml + 预渲染详情页
const fs = require('fs')
const path = require('path')
const distDir = 'dist'
const baseUrl = 'https://xiaoyi741.github.io/nav'

// 读取所有数据
const db = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'))
const skills = JSON.parse(fs.readFileSync('data/skills.json', 'utf-8'))
const prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf-8'))
const news = JSON.parse(fs.readFileSync('data/news.json', 'utf-8'))
const mcp = JSON.parse(fs.readFileSync('data/mcp.json', 'utf-8'))
const learning = JSON.parse(fs.readFileSync('data/learning.json', 'utf-8'))

// 收集工具 URL
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

tools.forEach(function(t) {
  addUrl('/detail/' + t.id, '0.6', 'weekly')
})
skills.forEach(function(s) {
  addUrl('/skills/' + s.id, '0.5', 'monthly')
})
prompts.forEach(function(p) {
  addUrl('/prompts/' + p.id, '0.5', 'monthly')
})
news.forEach(function(n) {
  addUrl('/news/' + n.id, '0.5', 'monthly')
})
mcp.forEach(function(m) {
  addUrl('/mcp/' + m.id, '0.5', 'monthly')
})
learning.forEach(function(l) {
  addUrl('/learning/' + l.id, '0.5', 'monthly')
})

var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>'
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8')
console.log('✅ sitemap.xml 已生成 (URL数: ' + (urls.split('\n').length - 1) + ')')

// ============================================================
// 2. 预渲染详情页（包含SPA脚本）
// ============================================================
var spaHtml = ''
try { spaHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8') } catch(e) {
  spaHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="/nav/"></head><body></body></html>'
}

function escapeHtml(str) { return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function stripTags(str) { return (str || '').replace(/<[^>]*>/g, '') }

function preRender(items, type, idField, nameField, descField, extraMeta) {
  var count = 0
  var detailDir = path.join(distDir, type)
  if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true })

  items.forEach(function(item) {
    var id = item[idField || 'id']
    var name = escapeHtml(item[nameField || 'name'] || '')
    var desc = escapeHtml(stripTags(item[descField || 'description'] || '').substring(0, 200))
    var pageTitle = name + ' - YiGo-Ai导航'
    var pageUrl = baseUrl + '/' + type + '/' + id

    var metaHtml = '<meta property="og:title" content="' + pageTitle + '" />\n'
      + '<meta property="og:description" content="' + desc + '" />\n'
      + '<meta property="og:url" content="' + pageUrl + '" />\n'
      + '<meta property="og:type" content="website" />\n'
      + '<meta property="og:site_name" content="YiGo-Ai导航" />\n'
      + '<meta name="twitter:card" content="summary_large_image" />\n'
      + '<meta name="twitter:title" content="' + pageTitle + '" />\n'
      + '<meta name="twitter:description" content="' + desc + '" />\n'
      + (extraMeta || '')

    var html = spaHtml
      .replace(/<title>[^<]*<\/title>/, '<title>' + pageTitle + '</title>')
      .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + desc + '" />')
      .replace('</head>', metaHtml + '</head>')

    var pageDir = path.join(detailDir, String(id))
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true })
    fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8')
    count++
  })
  return count
}

var total = 0
total += preRender(tools, 'detail', 'id', 'name', 'desc')
total += preRender(skills, 'skills', 'id', 'name', 'description')
total += preRender(prompts, 'prompts', 'id', 'title', 'description')
total += preRender(news, 'news', 'id', 'title', 'description')
total += preRender(mcp, 'mcp', 'id', 'name', 'description')
total += preRender(learning, 'learning', 'id', 'title', 'description')

console.log('✅ 预渲染页面完成: ' + total + ' 个页面')