/**
 * 全量抓取 Skills 数据（遍历 341 页列表 + 逐条详情）
 * 增量更新：已有 content 的跳过，新 skill 自动追加
 *
 * 用法: node scripts/scrape_all_skills.mjs [起始页码] [结束页码]
 * 示例: node scripts/scrape_all_skills.mjs 2 10   (抓取第2-10页)
 *        node scripts/scrape_all_skills.mjs          (抓取全部341页)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILLS_PATH = path.resolve(__dirname, '../data/skills.json')
const BASE_URL = 'https://ai.codefather.cn/skills'

const START_PAGE = parseInt(process.argv[2] || '1', 10)
const END_PAGE = parseInt(process.argv[3] || '341', 10)
const BATCH_SAVE_INTERVAL = 20  // 每抓 N 页保存一次

// ── 读取已有数据 ──
let allSkills = []
try {
  allSkills = JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8'))
} catch { allSkills = [] }

const existingIds = new Set(allSkills.map(s => String(s.id)))

let totalNew = 0
let totalDetail = 0

// ── 工具函数 ──
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function cleanText(str) {
  return str.replace(/\s+/g, ' ').trim()
}

function saveProgress() {
  fs.writeFileSync(SKILLS_PATH, JSON.stringify(allSkills, null, 2), 'utf-8')
}

// ── 抓取列表页 ──
async function fetchListPage(page) {
  const url = `${BASE_URL}?current=${page}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NavBot/1.0)' },
  })
  if (!res.ok) {
    console.log(`    HTTP ${res.status}, skip`)
    return []
  }
  const html = await res.text()

  // 提取所有 skill 卡片
  const skills = []
  // 匹配模式: <a href="/skills/{id}">\n  {name}\n  {desc}\n  {tags}
  const cardRegex = /<a\s+href="\/skills\/(\d+)"[^>]*>\s*([^<]+)\s*<p[^>]*>([\s\S]*?)<\/p>/g
  let match
  while ((match = cardRegex.exec(html)) !== null) {
    const id = match[1]
    const name = cleanText(match[2])
    const desc = cleanText(match[3]).replace(/<[^>]+>/g, ' ')

    // 提取标签：在卡片内找 <span class="skill-tag"> 或类似
    const tagRegex = /<span[^>]*class="[^"]*skill-tag[^"]*"[^>]*>([^<]+)<\/span>/g
    const tags = []
    let tagMatch
    while ((tagMatch = tagRegex.exec(html.slice(match.index, match.index + match[0].length))) !== null) {
      tags.push(cleanText(tagMatch[1]))
    }

    // 如果上面没找到标签，从卡片附近的标签提取
    if (tags.length === 0) {
      const nearbyTagRegex = /(?:效率工具|软件开发|数据与分析|文档处理|内容与媒体|Claude官方|商业与营销|测试与安全|开发运维|数据库|区块链|生活方式|协作与管理|研究|AI)/g
      let tMatch
      while ((tMatch = nearbyTagRegex.exec(desc)) !== null) {
        tags.push(tMatch[1])
      }
      // 去重
      const unique = [...new Set(tags)]
      tags.length = 0
      tags.push(...unique)
    }

    skills.push({ id, name, description: desc, tags })
  }

  // 备选提取方式：直接匹配卡片区域
  if (skills.length === 0) {
    // 找所有 /skills/{id} 链接
    const linkRegex = /<a[^>]*href="\/skills\/(\d+)"[^>]*>/g
    const ids = new Set()
    while ((match = linkRegex.exec(html)) !== null) {
      ids.add(match[1])
    }
    for (const id of ids) {
      skills.push({ id, name: '', description: '', tags: [] })
    }
  }

  return skills
}

// ── 抓取详情页 ──
async function fetchDetail(id) {
  const url = `${BASE_URL}/${id}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NavBot/1.0)' },
  })
  if (!res.ok) {
    return { content: '', installCmd: '', githubUrl: '', tags: [] }
  }
  const html = await res.text()

  // 提取纯文本
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

  // 提取 SKILL.md 内容
  let content = ''
  const startMarkers = [
    'Complete terms in LICENSE.txt',
    'complete terms in LICENSE.txt',
    'Complete terms in License',
  ]
  let startIdx = -1
  for (const m of startMarkers) {
    const idx = text.indexOf(m)
    if (idx > 0) { startIdx = idx + m.length; break }
  }
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
  if (startIdx > 0) {
    const endMarkers = ['🔥热门工具', '热门工具', 'Skills 推荐', '常见问题']
    let endIdx = text.length
    for (const m of endMarkers) {
      const idx = text.indexOf(m, startIdx)
      if (idx > 0 && idx < endIdx) endIdx = idx
    }
    content = text.slice(startIdx, endIdx).trim()
    content = content.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  // 提取 GitHub URL
  const ghMatch = html.match(/https:\/\/github\.com\/[^"' \t]+/)
  const githubUrl = ghMatch ? ghMatch[0] : ''

  // 提取安装命令
  const installMatch = html.match(/npx skills add[^<"\n]+/)
  const installCmd = installMatch ? installMatch[0].trim() : ''

  // 提取标签 (从详情页)
  const detailTags = []
  const tagRegex = /<span[^>]*class="[^"]*detail-tag[^"]*"[^>]*>([^<]+)<\/span>/g
  let tMatch
  while ((tMatch = tagRegex.exec(html)) !== null) {
    detailTags.push(cleanText(tMatch[1]))
  }

  return { content, installCmd, githubUrl, tags: detailTags }
}

// ── 主流程 ──
async function main() {
  console.log(`Skills 全量抓取 — 页面 ${START_PAGE} ~ ${END_PAGE}`)
  console.log(`当前已有: ${allSkills.length} 条, 已覆盖 ID: ${existingIds.size}\n`)

  let listCount = 0

  for (let page = START_PAGE; page <= END_PAGE; page++) {
    process.stdout.write(`[第${page}页] `)

    try {
      const pageSkills = await fetchListPage(page)
      if (pageSkills.length === 0) {
        console.log(`0 条`)
        await sleep(500)
        continue
      }
      listCount += pageSkills.length
      console.log(`${pageSkills.length} 条`)

      for (const ps of pageSkills) {
        if (existingIds.has(ps.id)) {
          // 已有但缺 content 的补抓详情
          const existing = allSkills.find(s => String(s.id) === ps.id)
          if (existing && (!existing.content || existing.content.length < 200)) {
            process.stdout.write(`  补抓详情 ${ps.id} ... `)
            const detail = await fetchDetail(ps.id)
            if (detail.content && detail.content.length > 200) {
              existing.content = detail.content
              totalDetail++
            }
            if (detail.installCmd && !existing.installCmd) existing.installCmd = detail.installCmd
            if (detail.githubUrl && !existing.githubUrl) existing.githubUrl = detail.githubUrl
            console.log(`${detail.content.length} chars`)
            await sleep(300)
          }
          continue
        }

        // 新 skill
        process.stdout.write(`  新增 ${ps.name || ps.id} ... `)
        const detail = await fetchDetail(ps.id)
        const newSkill = {
          id: ps.id,
          name: ps.name || detail.installCmd?.match(/--skill\s+"([^"]+)"/)?.[1] || ps.id,
          description: ps.description || '',
          tags: detail.tags.length > 0 ? detail.tags : ps.tags,
          githubUrl: detail.githubUrl || '',
          installCmd: detail.installCmd || '',
          createdAt: new Date().toISOString().slice(0, 10),
        }
        if (detail.content && detail.content.length > 200) {
          newSkill.content = detail.content
          totalDetail++
        }
        allSkills.push(newSkill)
        existingIds.add(ps.id)
        totalNew++
        console.log(`${newSkill.name} (content: ${(detail.content || '').length} chars)`)
        await sleep(300)
      }

      // 定期保存
      if (page % BATCH_SAVE_INTERVAL === 0 || page === END_PAGE) {
        saveProgress()
        console.log(`  ⏺ 已保存 (共${allSkills.length}条)`)
      }

      await sleep(500 + Math.random() * 300)
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
      saveProgress()
      await sleep(2000)
    }
  }

  saveProgress()
  console.log(`\n✅ 完成! 共扫描 ${END_PAGE - START_PAGE + 1} 页, ${listCount} 条列表数据`)
  console.log(`   新增 ${totalNew} 条, 补充详情 ${totalDetail} 条, 总计 ${allSkills.length} 条`)
}

main().catch(console.error)
