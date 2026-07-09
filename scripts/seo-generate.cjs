// SEO 优化脚本：生成 sitemap.xml + 预渲染详情页静态 HTML
// 在 Angular 构建后运行

const fs = require('fs')
const path = require('path')

// 读取数据
const data = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'))
const distDir = 'dist'
const baseUrl = 'https://xiaoyi741.github.io/nav'

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
// 2. 预渲染详情页静态 HTML
// ============================================================
var detailDir = path.join(distDir, 'detail')
if (!fs.existsSync(detailDir)) {
  fs.mkdirSync(detailDir, { recursive: true })
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
  var richDesc = (t['richDesc'] || '').replace(/href="\//g, 'href="' + baseUrl + '/')
  var richText = stripTags(t['richDesc'] || '').substring(0, 500)
  var pageTitle = name + ' - YiGo-Ai导航'
  var pageUrl = baseUrl + '/detail/' + t.id
  var imgUrl = escapeHtml(t.icon || baseUrl + '/assets/logo.png')

  // JSON-LD
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.name,
    url: t.url || pageUrl,
    description: richText || desc,
    applicationCategory: 'Multimedia',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
  }
  var ldStr = JSON.stringify(ld).replace(/</g, '\\u003c')

  // 构建静态 HTML
  var html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
  html += '<meta charset="utf-8" />\n'
  html += '<meta name="viewport" content="width=device-width, initial-scale=1" />\n'
  html += '<title>' + pageTitle + '</title>\n'
  html += '<meta name="description" content="' + (desc || name + ' AI工具介绍和官网') + '" />\n'
  html += '<meta name="keywords" content="' + name + ',AI工具,' + name + '官网" />\n'
  // OG 标签
  html += '<meta property="og:title" content="' + pageTitle + '" />\n'
  html += '<meta property="og:description" content="' + (desc || name + ' AI工具介绍') + '" />\n'
  html += '<meta property="og:image" content="' + imgUrl + '" />\n'
  html += '<meta property="og:url" content="' + pageUrl + '" />\n'
  html += '<meta property="og:type" content="website" />\n'
  html += '<meta property="og:site_name" content="YiGo-Ai导航" />\n'
  // Twitter Card
  html += '<meta name="twitter:card" content="summary_large_image" />\n'
  html += '<meta name="twitter:title" content="' + pageTitle + '" />\n'
  html += '<meta name="twitter:description" content="' + (desc || name + ' AI工具介绍') + '" />\n'
  html += '<meta name="twitter:image" content="' + imgUrl + '" />\n'
  // JSON-LD
  html += '<script type="application/ld+json">' + ldStr + '</script>\n'
  // 重定向到 SPA (通过 meta refresh 和 JS)
  html += '<meta http-equiv="refresh" content="0;url=/" />\n'
  html += '<script>window.location.href="/";</script>\n'
  html += '</head>\n<body>\n'
  // 页面内容（给搜索引擎爬虫）
  html += '<h1>' + name + '</h1>\n'
  html += '<p>' + desc + '</p>\n'
  if (t['richDesc']) {
    html += '<div>' + richDesc.substring(0, 2000) + '</div>\n'
  }
  html += '<a href="' + escapeHtml(t.url || '') + '" rel="nofollow">访问官网</a>\n'
  html += '</body>\n</html>'

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
