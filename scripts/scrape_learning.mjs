import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.resolve(__dirname, '../data/learning.json')
const BASE = 'https://ai.codefather.cn/resource/encyclopedia'
let all = []; try { all = JSON.parse(fs.readFileSync(DATA_PATH,'utf-8')) } catch {}
const existingIds = new Set(all.map(s => String(s.id)))

async function fetchPage(p) {
  const res = await fetch(`${BASE}?current=${p}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const ids = [...new Set([...html.matchAll(/href="\/resource\/encyclopedia\/(\d+)"/g)].map(m => m[1]))]
  return ids.filter(id => !existingIds.has(id))
}

async function fetchDetail(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const title = titleMatch ? titleMatch[1].trim() : ''
  const descMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/)
  let description = descMatch ? descMatch[1].replace(/<[^>]+>/g,'').trim() : ''
  const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<nav[\s\S]*?<\/nav>/gi,'').replace(/<header[\s\S]*?<\/header>/gi,'').replace(/<footer[\s\S]*?<\/footer>/gi,'').replace(/<[^>]+>/g,'\n').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim()
  let content = ''
  const di = text.indexOf(description)
  if (di > 0) {
    let ei = text.length
    for (const m of ['🔥热门工具', '🔥 热门文章']) { const idx = text.indexOf(m, di); if (idx > 0 && idx < ei) ei = idx }
    content = text.slice(di + description.length, ei).trim(); if (content.length < 50) content = ''
  }
  const dateMatch = html.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/)
  return { title: title || id, description, content, createdAt: dateMatch ? dateMatch[1] : new Date().toISOString().slice(0,10) }
}

async function main() {
  console.log('AI学习资源 — 15 页'); let total = all.length
  for (let p = 1; p <= 15; p++) {
    process.stdout.write(`[${p}/15] `)
    try {
      const ids = await fetchPage(p); if (ids.length === 0) { console.log('0'); continue }
      for (const id of ids) { const d = await fetchDetail(id); all.push({ id, title: d.title, description: d.description, content: d.content, createdAt: d.createdAt }); existingIds.add(id); total++; process.stdout.write('.') }
      console.log(` ${ids.length} (total ${total})`)
    } catch(e) { console.log(` ERR: ${e.message}`) }
    if (p % 5 === 0 || p === 15) { fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2)); console.log(`  saved (${all.length})`) }
    await new Promise(r => setTimeout(r, 200))
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2)); console.log(`\n✅ Done! Total ${all.length}`)
}
main().catch(console.error)