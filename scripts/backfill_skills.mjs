/**
 * 补抓现有 skills 中缺 content 的详情
 * 用法: node scripts/backfill_skills.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS_PATH = path.resolve(__dirname, '../data/skills.json')

async function fetchDetail(id) {
  const res = await fetch('https://ai.codefather.cn/skills/' + id, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const html = await res.text()
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/').replace(/&#x26;/g, '&')
    .replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  let content = ''
  for (const m of ['Complete terms in LICENSE.txt', 'complete terms in LICENSE.txt']) {
    const idx = text.indexOf(m)
    if (idx > 0) {
      let end = text.length
      for (const em of ['🔥热门工具', '热门工具', 'Skills 推荐', '常见问题']) {
        const ei = text.indexOf(em, idx)
        if (ei > 0 && ei < end) end = ei
      }
      content = text.slice(idx + m.length, end).trim()
      content = content.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()
      break
    }
  }

  // 提取 tags / install / github
  const lines = text.split('\n').map(l => l.trim())
  const tags = [...new Set(lines.filter(l => ['效率工具','软件开发','数据与分析','文档处理','内容与媒体','Claude官方','商业与营销','测试与安全','开发运维','数据库','区块链','生活方式','协作与研究','研究'].includes(l)))]
  const installMatch = html.match(/npx skills add[^<"\n]+/)
  const ghMatch = html.match(/https:\/\/github\.com\/[^"'\s]+/)
  const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  const name = nameMatch ? nameMatch[1].trim() : ''

  return { content, tags, installCmd: installMatch ? installMatch[0].trim() : '', githubUrl: ghMatch ? ghMatch[0] : '', name }
}

const skills = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8'))
const toBackfill = skills.filter(s => !s.content || s.content.length < 200)
console.log(`Need backfill: ${toBackfill.length} skills`)

let done = 0
for (const s of toBackfill) {
  process.stdout.write(`[${++done}/${toBackfill.length}] ${s.id} ... `)
  try {
    const d = await fetchDetail(s.id)
    if (d.content && d.content.length > 200) {
      s.content = d.content
      console.log(`${d.content.length} chars`)
    } else {
      console.log('no content')
    }
    if (d.tags.length > 0 && (!s.tags || s.tags.length === 0)) s.tags = d.tags
    if (d.name && !s.name) s.name = d.name
    if (d.installCmd && !s.installCmd) s.installCmd = d.installCmd
    if (d.githubUrl && !s.githubUrl) s.githubUrl = d.githubUrl
  } catch(e) {
    console.log('ERROR: ' + e.message)
  }
  await new Promise(r => setTimeout(r, 200))

  if (done % 50 === 0) {
    fs.writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2))
    console.log(`  saved (${skills.filter(s => s.content && s.content.length > 200).length} with content)`)
  }
}

fs.writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2))
const final = skills.filter(s => s.content && s.content.length > 200).length
console.log(`\nDone! ${final}/${skills.length} now have content.`)