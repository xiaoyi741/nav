/**
 * 快速抓取 Skills 列表页（仅提取 ID）
 * 用法: node scripts/scrape_list.mjs [起始] [结束]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS_PATH = path.resolve(__dirname, '../data/skills.json')
const BASE_URL = 'https://ai.codefather.cn/skills'

let allSkills = []
try { allSkills = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8')) } catch {}
const existingIds = new Set(allSkills.map(s => String(s.id)))

const START = parseInt(process.argv[2] || '1', 10)
const END = parseInt(process.argv[3] || '341', 10)

async function fetchPageIds(page) {
  const url = `${BASE_URL}?current=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) return []
  const html = await res.text()
  // 提取所有 /skills/{id} 链接
  const ids = [...new Set([...html.matchAll(/href="\/skills\/(\d+)"/g)].map(m => m[1]))]
  return ids.filter(id => !existingIds.has(id))
}

async function main() {
  let total = 0
  for (let p = START; p <= END; p++) {
    process.stdout.write(`[${p}/${END}] `)
    try {
      const ids = await fetchPageIds(p)
      if (ids.length === 0) { console.log('0'); continue }
      for (const id of ids) {
        allSkills.push({ id, name: '', description: '', tags: [], createdAt: new Date().toISOString().slice(0, 10) })
        existingIds.add(id)
        total++
      }
      console.log(`${ids.length} (total ${total})`)
    } catch (e) {
      console.log(`ERR: ${e.message}`)
    }
    // 每 50 页保存一次
    if (p % 50 === 0 || p === END) {
      fs.writeFileSync(SKILLS_PATH, JSON.stringify(allSkills, null, 2))
      console.log(`  ⏺ saved (${allSkills.length})`)
    }
    await new Promise(r => setTimeout(r, 100))
  }
  fs.writeFileSync(SKILLS_PATH, JSON.stringify(allSkills, null, 2))
  console.log(`\n✅ Done! Pages ${START}-${END}, total ${allSkills.length}`)
}
main().catch(console.error)