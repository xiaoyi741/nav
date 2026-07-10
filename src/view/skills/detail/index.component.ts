// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ISkill } from 'src/types/skills'
import { skillsList } from 'src/store'
import { $t } from 'src/locale'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-skills-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class SkillsDetailComponent implements OnInit {
  $t = $t
  skill?: ISkill
  relatedSkills: ISkill[] = []
  copyDone = false

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.loadSkill(id)
    }
  }

  loadSkill(id: string) {
    this.skill = skillsList.find((s) => String(s.id) === id)
    if (this.skill) {
      this.loadRelated()
    }
    this.cdr.markForCheck()
  }

  loadRelated() {
    if (!this.skill?.relatedIds?.length) {
      this.relatedSkills = []
      return
    }
    this.relatedSkills = skillsList.filter((s) =>
      this.skill?.relatedIds?.includes(s.id)
    )
    this.cdr.markForCheck()
  }

  goBack() {
    this.router.navigate(['/skills'])
  }

  goToDetail(id: string | number) {
    this.router.navigate(['/skills', id])
  }

  copyInstallCmd() {
    if (this.skill?.installCmd) {
      navigator.clipboard.writeText(this.skill.installCmd).then(() => {
        this.copyDone = true
        setTimeout(() => (this.copyDone = false), 2000)
      })
    }
  }
}
