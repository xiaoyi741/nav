/**
 * 从列表页补抓名称和描述（基于实际 HTML 结构）
 * 用法: node scripts/backfill_names.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS_PATH = path.resolve(__dirname, '../data/skills.json')
const BASE_URL = 'https://ai.codefather.cn/skills'

const skills = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8'))
const idMap = new Map(skills.map(s => [s.id, s]))

async function fetchPage(page) {
  const url = `${BASE_URL}?current=${page}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()

  // 提取所有卡片区块
  const cards = html.match(/<a[^>]*href="\/skills\/(\d+)"[^>]*>[\s\S]*?<\/a>/g) || []
  const results = []
  for (const card of cards) {
    const idMatch = card.match(/href="\/skills\/(\d+)"/)
    if (!idMatch) continue
    const id = idMatch[1]

    // 提取名称: <div class="text-base font-medium ...">name</div>
    const nameMatch = card.match(/text-base font-medium[^>]*>([^<]+)</)
    const name = nameMatch ? nameMatch[1].trim() : ''

    // 提取描述: <div class="text-sm text-gray-500 line-clamp-2 h-10">desc</div>
    const descMatch = card.match(/text-sm text-gray-500[^>]*>([\s\S]*?)<\/div>/)
    const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : ''

    // 提取标签
    const tags = []
    const tagRegex = /ant-tag[^>]*>([^<]+)<\/span>/g
    let t
    while ((t = tagRegex.exec(card)) !== null) {
      tags.push(t[1].trim())
    }

    if (name) results.push({ id, name, description: desc, tags })
  }
  return results
}

async function main() {
  let updated = 0
  for (let p = 1; p <= 341; p++) {
    process.stdout.write(`[${p}/341] `)
    try {
      const items = await fetchPage(p)
      let count = 0
      for (const item of items) {
        const skill = idMap.get(item.id)
        if (skill && (!skill.name || skill.name === '')) {
          skill.name = item.name
          if (item.description) skill.description = item.description
          if (item.tags.length > 0) skill.tags = item.tags
          count++
          updated++
        }
      }
      console.log(`${count} updated`)
    } catch (e) {
      console.log(`ERR: ${e.message}`)
    }
    if (p % 50 === 0 || p === 341) {
      fs.writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2))
      console.log(`  saved (${updated} names updated)`)
    }
    await new Promise(r => setTimeout(r, 80))
  }
  fs.writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2))
  console.log(`\n✅ Done! Updated ${updated} names`)
}
main().catch(console.error)