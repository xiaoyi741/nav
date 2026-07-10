/**
 * 抓取 AI 资讯列表页
 * 用法: node scripts/scrape_news.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.resolve(__dirname, '../data/news.json')
const BASE_URL = 'https://ai.codefather.cn/news'

let allNews = []
try { allNews = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) } catch {}
const existingIds = new Set(allNews.map(s => String(s.id)))

async function fetchPage(page) {
  const url = `${BASE_URL}?current=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const ids = [...new Set([...html.matchAll(/href="\/news\/(\d+)"/g)].map(m => m[1]))]
  return ids.filter(id => !existingIds.has(id))
}

async function fetchDetail(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<nav[\s\S]*?<\/nav>/gi,'').replace(/<header[\s\S]*?<\/header>/gi,'').replace(/<footer[\s\S]*?<\/footer>/gi,'').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim()
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)

  // 描述是第一段正文（h1 后的第一段长文本）
  let description = ''
  const h1Idx = lines.findIndex(l => l === title)
  if (h1Idx >= 0) {
    for (let i = h1Idx + 1; i < lines.length; i++) {
      if (lines[i].length > 30 && !lines[i].includes('阅读') && !lines[i].includes('关注') && !lines[i].includes('原文链接') && !lines[i].includes('🔥')) {
        description = lines[i]; break
      }
    }
  }

  // 内容：从描述之后到 "原文链接" 或 "🔥"
  let content = ''
  const descIdx = text.indexOf(description)
  if (descIdx > 0) {
    let endIdx = text.length
    for (const m of ['原文链接', '🔥热门文章', '🔥热门工具']) {
      const idx = text.indexOf(m, descIdx)
      if (idx > 0 && idx < endIdx) endIdx = idx
    }
    content = text.slice(descIdx, endIdx).trim()
    if (content.length < 100) content = ''
  }

  // 作者
  const authorMatch = html.match(/<a[^>]*href="\/user\/\d+"[^>]*>([^<]+)<\/a>/)
  const author = authorMatch ? authorMatch[1].trim() : ''

  // 时间
  const dateMatch = html.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/)
  const createdAt = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)

  // 阅读数
  const readMatch = html.match(/阅读\s*(\d+)/)
  const readCount = readMatch ? parseInt(readMatch[1]) : 0

  // 原文链接
  const sourceMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*>原文/)
  const sourceUrl = sourceMatch ? sourceMatch[1] : ''

  return { title: title || id, description, content, author, createdAt, readCount, sourceUrl }
}

async function main() {
  console.log('AI 资讯抓取 — 400 页')
  let total = allNews.length
  for (let p = 1; p <= 100; p++) {
    process.stdout.write(`[${p}/400] `)
    try {
      const ids = await fetchPage(p)
      if (ids.length === 0) { console.log('0'); continue }
      for (const id of ids) {
        const d = await fetchDetail(id)
        allNews.push({ id, title: d.title, description: d.description, content: d.content, author: d.author, createdAt: d.createdAt, readCount: d.readCount, sourceUrl: d.sourceUrl })
        existingIds.add(id); total++
        process.stdout.write('.')
      }
      console.log(` ${ids.length} (total ${total})`)
    } catch (e) { console.log(` ERR: ${e.message}`) }
    if (p % 20 === 0 || p === 400) { fs.writeFileSync(DATA_PATH, JSON.stringify(allNews, null, 2)); console.log(`  saved (${allNews.length})`) }
    await new Promise(r => setTimeout(r, 200))
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(allNews, null, 2))
  console.log(`\n✅ Done! Total ${allNews.length} news`)
}
main().catch(console.error)