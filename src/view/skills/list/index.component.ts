// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ISkill } from 'src/types/skills'
import { skillsList } from 'src/store'
import { $t } from 'src/locale'

@Component({
  selector: 'app-skills-list',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SkillsListComponent implements OnInit {
  $t = $t
  allSkills: ISkill[] = skillsList
  filteredSkills: ISkill[] = []
  allTags: string[] = []
  activeTag = ''
  searchKeyword = ''
  currentPage = 1
  pageSize = 40
  totalPages = 1

  constructor(private router: Router) {}

  ngOnInit() {
    this.extractTags()
    this.applyFilters()
  }

  extractTags() {
    const tagSet = new Set<string>()
    this.allSkills.forEach((s) => s.tags?.forEach((t) => tagSet.add(t)))
    this.allTags = Array.from(tagSet).sort()
  }

  applyFilters() {
    let list = [...this.allSkills]

    if (this.searchKeyword) {
      const kw = this.searchKeyword.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.description.toLowerCase().includes(kw)
      )
    }

    if (this.activeTag) {
      list = list.filter((s) => s.tags?.includes(this.activeTag))
    }

    // 如果当前页超出总页数，重置到第1页
    const newTotal = Math.ceil(list.length / this.pageSize) || 1
    if (this.currentPage > newTotal) {
      this.currentPage = 1
    }
    this.totalPages = newTotal
    const start = (this.currentPage - 1) * this.pageSize
    this.filteredSkills = list.slice(start, start + this.pageSize)
  }

  onSearch() {
    this.currentPage = 1
    this.applyFilters()
  }

  onTagClick(tag: string) {
    this.activeTag = this.activeTag === tag ? '' : tag
    this.currentPage = 1
    this.applyFilters()
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return
    this.currentPage = page
    this.applyFilters()
  }

  goToDetail(id: string | number) {
    this.router.navigate(['/skills', id])
  }

  get pages(): number[] {
    const total = this.totalPages
    const cur = this.currentPage
    const p: number[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) p.push(i)
      return p
    }

    // 第一页
    p.push(1)

    // 当前页左边
    if (cur > 3) {
      p.push(-1) // -1 表示省略号
    }

    const start = Math.max(2, cur - 1)
    const end = Math.min(total - 1, cur + 1)
    for (let i = start; i <= end; i++) p.push(i)

    // 当前页右边
    if (cur < total - 2) {
      p.push(-1) // -1 表示省略号
    }

    // 最后一页
    if (total > 1) p.push(total)

    return p
  }
}