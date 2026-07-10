import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ILearning } from 'src/types/learning'
import { learningList } from 'src/store'

@Component({
  selector: 'app-learning-list',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class LearningListComponent implements OnInit {
  all: ILearning[] = learningList
  filtered: ILearning[] = []
  searchKeyword = ''
  currentPage = 1; pageSize = 40; totalPages = 1

  constructor(private router: Router) {}

  ngOnInit() { this.applyFilters() }

  applyFilters() {
    let list = [...this.all]
    if (this.searchKeyword) { const kw = this.searchKeyword.toLowerCase(); list = list.filter(s => s.title.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw)) }
    const newTotal = Math.ceil(list.length / this.pageSize) || 1
    if (this.currentPage > newTotal) this.currentPage = 1
    this.totalPages = newTotal
    this.filtered = list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
  }

  onSearch() { this.currentPage = 1; this.applyFilters() }
  goToPage(page: number) { if (page < 1 || page > this.totalPages) return; this.currentPage = page; this.applyFilters() }
  goToDetail(id: string | number) { this.router.navigate(['/learning', id]) }

  get pages(): number[] {
    const total = this.totalPages, cur = this.currentPage, p: number[] = []
    if (total <= 7) { for (let i = 1; i <= total; i++) p.push(i); return p }
    p.push(1); if (cur > 3) p.push(-1)
    const s = Math.max(2, cur - 1), e = Math.min(total - 1, cur + 1)
    for (let i = s; i <= e; i++) p.push(i)
    if (cur < total - 2) p.push(-1); if (total > 1) p.push(total)
    return p
  }
}