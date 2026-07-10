/**
 * 抓取 AI 提示词列表页
 * 用法: node scripts/scrape_prompts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.resolve(__dirname, '../data/prompts.json')
const BASE_URL = 'https://ai.codefather.cn/prompt'

let allPrompts = []
try { allPrompts = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')) } catch {}
const existingIds = new Set(allPrompts.map(s => String(s.id)))

async function fetchPage(page) {
  const url = `${BASE_URL}?current=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const ids = [...new Set([...html.matchAll(/href="\/prompt\/(\d+)"/g)].map(m => m[1]))]
  return ids.filter(id => !existingIds.has(id))
}

async function fetchDetail(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()

  // 提取标题
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : ''

  // 提取描述（h1 后面的 p 标签）
  const descMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/)
  let description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : ''

  // 提取完整内容（描述后面的内容，直到 "复制提示词" 或 "相关推荐"）
  const contentStart = html.indexOf(description) + description.length
  const copyIdx = html.indexOf('复制提示词', contentStart)
  const relatedIdx = html.indexOf('相关推荐', contentStart)
  let endIdx = html.length
  if (copyIdx > 0 && copyIdx < endIdx) endIdx = copyIdx
  if (relatedIdx > 0 && relatedIdx < endIdx) endIdx = relatedIdx
  let content = html.slice(contentStart, endIdx)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/\s+/g, ' ').trim()
  if (content.length < 50) content = ''

  // 提取标签
  const tags = []
  const tagRegex = /<a[^>]*href="\/prompt\?tag=([^"]+)"[^>]*>([^<]+)<\/a>/g
  let t
  while ((t = tagRegex.exec(html)) !== null) {
    const tag = t[2].trim()
    if (!['编程导航', '+ 关注', '登录/注册'].includes(tag)) tags.push(tag)
  }

  // 作者
  const authorMatch = html.match(/<a[^>]*href="\/user\/\d+"[^>]*>([^<]+)<\/a>/)
  const author = authorMatch ? authorMatch[1].trim() : ''

  // 创建时间
  const dateMatch = html.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/)
  const createdAt = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)

  return { title, description, content, tags, author, createdAt }
}

async function main() {
  console.log('Prompt 抓取 — 64 页')
  let total = 0
  for (let p = 1; p <= 64; p++) {
    process.stdout.write(`[${p}/64] `)
    try {
      const ids = await fetchPage(p)
      if (ids.length === 0) { console.log('0'); continue }
      for (const id of ids) {
        const d = await fetchDetail(id)
        allPrompts.push({
          id,
          title: d.title || id,
          description: d.description || '',
          content: d.content || '',
          tags: d.tags || [],
          author: d.author || '',
          createdAt: d.createdAt || new Date().toISOString().slice(0, 10),
        })
        existingIds.add(id)
        total++
        process.stdout.write('.')
      }
      console.log(` ${ids.length} (total ${total})`)
    } catch (e) {
      console.log(` ERR: ${e.message}`)
    }
    if (p % 20 === 0 || p === 64) {
      fs.writeFileSync(DATA_PATH, JSON.stringify(allPrompts, null, 2))
      console.log(`  saved (${allPrompts.length})`)
    }
    await new Promise(r => setTimeout(r, 300))
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(allPrompts, null, 2))
  console.log(`\n✅ Done! Total ${allPrompts.length} prompts`)
}
main().catch(console.error)