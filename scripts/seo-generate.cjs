// SEO 优化脚本：生成 sitemap.xml + 预渲染详情页静态 HTML
// 在 Angular 构建后运行

const fs = require('fs')
const path = require('path')

// 读取数据
const data = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'))
const distDir = 'dist'
const baseUrl = 'https://xiaoyi741.github.io/nav'
const settingsTitle = 'YiGo-Ai导航'

// 收集所有工具
const tools = []
data.forEach(function(c) {
  c.nav.forEach(function(s) {
    s.nav.forEach(function(g) {
      g.nav.forEach(function(t) {
        tools.push(t)
      })
    })
  })
})

console.log('工具总数:', tools.length)

// ============================================================
// 1. 生成 sitemap.xml
// ============================================================
var urls = '<url><loc>' + baseUrl + '/</loc><priority>0.8</priority><changefreq>daily</changefreq></url>\n'

tools.forEach(function(t) {
  var name = (t.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  var desc = ((t.desc || '') + ' ' + (t['richDesc'] || '')).replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 200)

  urls += '<url>\n'
  urls += '  <loc>' + baseUrl + '/detail/' + t.id + '</loc>\n'
  urls += '  <lastmod>2026-07-09</lastmod>\n'
  urls += '  <changefreq>weekly</changefreq>\n'
  urls += '  <priority>0.6</priority>\n'
  urls += '</url>\n'
})

var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sitemap += urls
sitemap += '</urlset>'

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8')
console.log('✅ sitemap.xml 已生成 (' + (tools.length + 1) + ' 个URL)')

// ============================================================
// 2. 预渲染详情页（包含SPA脚本让Angular接管）
// ============================================================
var detailDir = path.join(distDir, 'detail')
if (!fs.existsSync(detailDir)) {
  fs.mkdirSync(detailDir, { recursive: true })
}

// 读取 SPA 的 index.html 模板
var spaHtml = ''
try {
  spaHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')
} catch(e) {
  spaHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><base href="/nav/"></head><body></body></html>'
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function stripTags(str) {
  return (str || '').replace(/<[^>]*>/g, '')
}

var count = 0
tools.forEach(function(t) {
  var name = escapeHtml(t.name || '')
  var desc = escapeHtml(stripTags(t.desc || ''))
  var pageTitle = name + ' - YiGo-Ai导航'
  var pageUrl = baseUrl + '/detail/' + t.id
  var imgUrl = escapeHtml(t.icon || baseUrl + '/assets/logo.png')

  // JSON-LD
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.name,
    url: t.url || pageUrl,
    description: stripTags(t['richDesc'] || t.desc || '').substring(0, 500),
    applicationCategory: 'Multimedia',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
  }
  var ldStr = JSON.stringify(ld).replace(/</g, '\\u003c')

  // 基于 SPA 模板生成预渲染页面
  var html = spaHtml
    .replace('<title>' + escapeHtml(settingsTitle) + '</title>', '<title>' + pageTitle + '</title>')
    .replace(/<meta name="description"[^>]*>/g, '<meta name="description" content="' + (desc || name + ' AI工具介绍和官网') + '" />')
    .replace('</head>',
      '<meta property="og:title" content="' + pageTitle + '" />\n' +
      '<meta property="og:description" content="' + (desc || name + ' AI工具介绍') + '" />\n' +
      '<meta property="og:image" content="' + imgUrl + '" />\n' +
      '<meta property="og:url" content="' + pageUrl + '" />\n' +
      '<meta property="og:type" content="website" />\n' +
      '<meta property="og:site_name" content="YiGo-Ai导航" />\n' +
      '<meta name="twitter:card" content="summary_large_image" />\n' +
      '<meta name="twitter:title" content="' + pageTitle + '" />\n' +
      '<meta name="twitter:description" content="' + (desc || name + ' AI工具介绍') + '" />\n' +
      '<meta name="twitter:image" content="' + imgUrl + '" />\n' +
      '<script type="application/ld+json">' + ldStr + '</script>\n' +
    '</head>'
  )

  // 写入文件
  var pageDir = path.join(detailDir, String(t.id))
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true })
  }
  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf-8')
  count++
})

console.log('✅ 预渲染详情页完成: ' + count + ' 个页面')
console.log('📁 输出目录: ' + distDir + '/detail/{id}/index.html')
