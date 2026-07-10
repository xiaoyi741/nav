import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { IMCP } from 'src/types/mcp'
import { mcpList } from 'src/store'
import { updateFileContent } from 'src/api'
import { MCP_PATH } from 'src/constants'

@Component({
  selector: 'app-system-mcp',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SystemMcpComponent implements OnInit {
  mcp: IMCP[] = [...mcpList]
  modalVisible = false; saving = false; editingMcp: IMCP | null = null
  validateForm!: FormGroup
  constructor(private fb: FormBuilder, private msg: NzMessageService) {}
  ngOnInit() { this.validateForm = this.fb.group({ name: ['', Validators.required], description: [''], tags: [[]], githubUrl: [''], content: [''] }) }
  showCreateModal() { this.editingMcp = null; this.validateForm.reset({ name: '', description: '', tags: [], githubUrl: '', content: '' }); this.modalVisible = true }
  openEditModal(m: IMCP) { this.editingMcp = m; this.validateForm.patchValue({ name: m.name, description: m.description, tags: m.tags || [], githubUrl: m.githubUrl || '', content: m.content || '' }); this.modalVisible = true }
  closeModal() { this.modalVisible = false; this.editingMcp = null }
  handleOk() {
    if (this.validateForm.invalid) return; this.saving = true; const data = this.validateForm.value
    if (this.editingMcp) { const idx = this.mcp.findIndex(s => s.id === this.editingMcp!.id); if (idx !== -1) this.mcp[idx] = { ...this.editingMcp, ...data, updatedAt: new Date().toISOString().slice(0, 10) } }
    else { this.mcp.push({ ...data, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }) }
    updateFileContent({ path: MCP_PATH, content: JSON.stringify(this.mcp, null, 2), message: 'update mcp' }).then(() => { this.msg.success(this.editingMcp ? '更新成功' : '创建成功'); this.saving = false; this.closeModal() }).catch(() => { this.msg.error('保存失败'); this.saving = false })
  }
  confirmDelete(id: string | number) { this.mcp = this.mcp.filter(s => s.id !== id); updateFileContent({ path: MCP_PATH, content: JSON.stringify(this.mcp, null, 2), message: 'delete mcp' }).then(() => this.msg.success('删除成功')).catch(() => this.msg.error('删除失败')) }
}