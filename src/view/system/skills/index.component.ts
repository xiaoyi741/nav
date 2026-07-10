// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { ISkill } from 'src/types/skills'
import { skillsList } from 'src/store'
import { updateFileContent } from 'src/api'
import { SKILLS_PATH } from 'src/constants'
import { $t } from 'src/locale'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system-skills',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SystemSkillsComponent implements OnInit {
  $t = $t
  skills: ISkill[] = [...skillsList]
  modalVisible = false
  saving = false
  editingSkill: ISkill | null = null
  validateForm!: FormGroup

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.validateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      tags: [[]],
      githubUrl: [''],
      installCmd: [''],
    })
  }

  showCreateModal() {
    this.editingSkill = null
    this.validateForm.reset({ name: '', description: '', tags: [], githubUrl: '', installCmd: '' })
    this.modalVisible = true
  }

  openEditModal(skill: ISkill) {
    this.editingSkill = skill
    this.validateForm.patchValue({
      name: skill.name,
      description: skill.description,
      tags: skill.tags || [],
      githubUrl: skill.githubUrl || '',
      installCmd: skill.installCmd || '',
    })
    this.modalVisible = true
  }

  closeModal() {
    this.modalVisible = false
    this.editingSkill = null
  }

  handleOk() {
    if (this.validateForm.invalid) return
    this.saving = true
    const formData = this.validateForm.value

    if (this.editingSkill) {
      // 更新
      const idx = this.skills.findIndex((s) => s.id === this.editingSkill!.id)
      if (idx !== -1) {
        this.skills[idx] = {
          ...this.editingSkill,
          ...formData,
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      }
    } else {
      // 新增
      this.skills.push({
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString().slice(0, 10),
      })
    }

    // 写回文件（和现有系统一致的保存机制）
    updateFileContent({
      path: SKILLS_PATH,
      content: JSON.stringify(this.skills, null, 2),
      message: 'update skills',
    }).then(() => {
      this.msg.success(this.editingSkill ? '更新成功' : '创建成功')
      this.saving = false
      this.closeModal()
      this.cdr.markForCheck()
    }).catch(() => {
      this.msg.error('保存失败')
      this.saving = false
      this.cdr.markForCheck()
    })
  }

  confirmDelete(id: string | number) {
    this.skills = this.skills.filter((s) => s.id !== id)
    updateFileContent({
      path: SKILLS_PATH,
      content: JSON.stringify(this.skills, null, 2),
      message: 'delete skill',
    }).then(() => {
      this.msg.success('删除成功')
      this.cdr.markForCheck()
    }).catch(() => {
      this.msg.error('删除失败')
      this.cdr.markForCheck()
    })
  }
}
