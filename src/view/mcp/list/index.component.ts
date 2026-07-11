import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IMCP } from 'src/types/mcp'
import { mcpList } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-mcp-list',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class McpListComponent implements OnInit {
  allMcp: IMCP[] = mcpList
  filteredMcp: IMCP[] = []
  allTags: string[] = []
  activeTag = ''
  searchKeyword = ''
  currentPage = 1
  pageSize = 40
  totalPages = 1

  constructor(private router: Router, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setPage('MCP 服务器', '发现全球好用的 MCP 服务器，重塑你的 AI 工作流', '/mcp')
    this.extractTags()
    this.applyFilters()
  }

  extractTags() {
    const tagSet = new Set<string>()
    this.allMcp.forEach(s => s.tags?.forEach(t => tagSet.add(t)))
    this.allTags = Array.from(tagSet).sort()
  }

  applyFilters() {
    let list = [...this.allMcp]
    if (this.searchKeyword) { const kw = this.searchKeyword.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)) }
    if (this.activeTag) list = list.filter(s => s.tags?.includes(this.activeTag))
    const newTotal = Math.ceil(list.length / this.pageSize) || 1
    if (this.currentPage > newTotal) this.currentPage = 1
    this.totalPages = newTotal
    const start = (this.currentPage - 1) * this.pageSize
    this.filteredMcp = list.slice(start, start + this.pageSize)
  }

  onSearch() { this.currentPage = 1; this.applyFilters() }
  onTagClick(tag: string) { this.activeTag = this.activeTag === tag ? '' : tag; this.currentPage = 1; this.applyFilters() }
  goToPage(page: number) { if (page < 1 || page > this.totalPages) return; this.currentPage = page; this.applyFilters() }
  goToDetail(id: string | number) { this.router.navigate(['/mcp', id]) }

  get pages(): number[] {
    const total = this.totalPages, cur = this.currentPage, p: number[] = []
    if (total <= 7) { for (let i = 1; i <= total; i++) p.push(i); return p }
    p.push(1)
    if (cur > 3) p.push(-1)
    const start = Math.max(2, cur - 1), end = Math.min(total - 1, cur + 1)
    for (let i = start; i <= end; i++) p.push(i)
    if (cur < total - 2) p.push(-1)
    if (total > 1) p.push(total)
    return p
  }
}