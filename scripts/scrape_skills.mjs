/**
 * 重新抓取 Skills 详情页的完整内容
 * 策略：内容在 "Complete terms" 之后、"🔥热门工具" 之前
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS_PATH = path.resolve(__dirname, '../data/skills.json')
const BASE_URL = 'https://ai.codefather.cn/skills'

async function fetchDetail(id) {
  const url = `${BASE_URL}/${id}`
  process.stdout.write(`  ${id} ... `)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NavBot/1.0)' },
  })
  const html = await res.text()

  // --- 从 HTML 提取纯文本 (去掉所有标签，保留换行) ---
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x26;/g, '&')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // 找到内容起点：license 行之后
  const startMarkers = [
    'Complete terms in LICENSE.txt',
    'complete terms in LICENSE.txt',
    'Complete terms in License',
  ]
  let startIdx = -1
  for (const m of startMarkers) {
    const idx = text.indexOf(m)
    if (idx > 0) {
      startIdx = idx + m.length
      break
    }
  }

  // 备选：找 "This skill" 或 "这项技能" 开头的行
  if (startIdx < 0) {
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim()
      if (/^(This skill|这项技能|指导构建|提供[^。]{10,})/i.test(l) && l.length > 20) {
        startIdx = text.indexOf(lines[i])
        break
      }
    }
  }

  if (startIdx < 0) {
    console.log('FAILED to find content start')
    return ''
  }

  // 找到内容终点
  const endMarkers = ['🔥热门工具', '热门工具', 'Skills 推荐', '常见问题']
  let endIdx = text.length
  for (const m of endMarkers) {
    const idx = text.indexOf(m, startIdx)
    if (idx > 0 && idx < endIdx) endIdx = idx
  }

  let content = text.slice(startIdx, endIdx).trim()

  // 清理行首尾空白
  content = content.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()

  console.log(`${content.length} chars`)
  return content
}

async function main() {
  const skills = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8'))
  console.log(`Total skills: ${skills.length}\n`)

  let updated = 0
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]
    process.stdout.write(`[${i+1}/${skills.length}] ${skill.name.padEnd(22)} `)

    try {
      const content = await fetchDetail(skill.id)
      if (content && content.length > 200) {
        skill.content = content
        updated++
      } else {
        console.log(`  ⚠️ content too short (${content.length} chars)`)
      }
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    }
  }

  fs.writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2), 'utf-8')
  console.log(`\nDone! Updated ${updated} skills.`)
}

main().catch(console.error)
