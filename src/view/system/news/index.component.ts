import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { INews } from 'src/types/news'
import { newsList } from 'src/store'
import { updateFileContent } from 'src/api'
import { NEWS_PATH } from 'src/constants'

@Component({
  selector: 'app-system-news',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SystemNewsComponent implements OnInit {
  news: INews[] = [...newsList]
  modalVisible = false; saving = false; editingNews: INews | null = null
  validateForm!: FormGroup
  constructor(private fb: FormBuilder, private msg: NzMessageService) {}
  ngOnInit() { this.validateForm = this.fb.group({ title: ['', Validators.required], description: [''], content: [''] }) }
  showCreateModal() { this.editingNews = null; this.validateForm.reset({ title: '', description: '', content: '' }); this.modalVisible = true }
  openEditModal(n: INews) { this.editingNews = n; this.validateForm.patchValue({ title: n.title, description: n.description, content: n.content || '' }); this.modalVisible = true }
  closeModal() { this.modalVisible = false; this.editingNews = null }
  handleOk() {
    if (this.validateForm.invalid) return; this.saving = true; const data = this.validateForm.value
    if (this.editingNews) { const idx = this.news.findIndex(s => s.id === this.editingNews!.id); if (idx !== -1) this.news[idx] = { ...this.editingNews, ...data, updatedAt: new Date().toISOString().slice(0, 10) } }
    else { this.news.push({ ...data, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }) }
    updateFileContent({ path: NEWS_PATH, content: JSON.stringify(this.news, null, 2), message: 'update news' }).then(() => { this.msg.success(this.editingNews ? '更新成功' : '创建成功'); this.saving = false; this.closeModal() }).catch(() => { this.msg.error('保存失败'); this.saving = false })
  }
  confirmDelete(id: string | number) { this.news = this.news.filter(s => s.id !== id); updateFileContent({ path: NEWS_PATH, content: JSON.stringify(this.news, null, 2), message: 'delete news' }).then(() => this.msg.success('删除成功')).catch(() => this.msg.error('删除失败')) }
}