import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { IPrompt } from 'src/types/prompts'
import { promptsList } from 'src/store'
import { updateFileContent } from 'src/api'
import { PROMPTS_PATH } from 'src/constants'

@Component({
  selector: 'app-system-prompts',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SystemPromptsComponent implements OnInit {
  prompts: IPrompt[] = [...promptsList]
  modalVisible = false
  saving = false
  editingPrompt: IPrompt | null = null
  validateForm!: FormGroup

  constructor(private fb: FormBuilder, private msg: NzMessageService) {}

  ngOnInit() {
    this.validateForm = this.fb.group({ title: ['', Validators.required], description: [''], tags: [[]], content: [''] })
  }

  showCreateModal() {
    this.editingPrompt = null
    this.validateForm.reset({ title: '', description: '', tags: [], content: '' })
    this.modalVisible = true
  }

  openEditModal(p: IPrompt) {
    this.editingPrompt = p
    this.validateForm.patchValue({ title: p.title, description: p.description, tags: p.tags || [], content: p.content || '' })
    this.modalVisible = true
  }

  closeModal() { this.modalVisible = false; this.editingPrompt = null }

  handleOk() {
    if (this.validateForm.invalid) return
    this.saving = true
    const data = this.validateForm.value
    if (this.editingPrompt) {
      const idx = this.prompts.findIndex(s => s.id === this.editingPrompt!.id)
      if (idx !== -1) this.prompts[idx] = { ...this.editingPrompt, ...data, updatedAt: new Date().toISOString().slice(0, 10) }
    } else {
      this.prompts.push({ ...data, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) })
    }
    updateFileContent({ path: PROMPTS_PATH, content: JSON.stringify(this.prompts, null, 2), message: 'update prompts' })
      .then(() => { this.msg.success(this.editingPrompt ? '更新成功' : '创建成功'); this.saving = false; this.closeModal() })
      .catch(() => { this.msg.error('保存失败'); this.saving = false })
  }

  confirmDelete(id: string | number) {
    this.prompts = this.prompts.filter(s => s.id !== id)
    updateFileContent({ path: PROMPTS_PATH, content: JSON.stringify(this.prompts, null, 2), message: 'delete prompt' })
      .then(() => this.msg.success('删除成功'))
      .catch(() => this.msg.error('删除失败'))
  }
}