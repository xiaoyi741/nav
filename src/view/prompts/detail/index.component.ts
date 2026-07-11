import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IPrompt } from 'src/types/prompts'
import { promptsList } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-prompts-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class PromptsDetailComponent implements OnInit {
  prompt?: IPrompt
  copyDone = false

  constructor(private route: ActivatedRoute, public router: Router, private seo: SeoService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.prompt = promptsList.find(s => String(s.id) === id)
      if (this.prompt) this.seo.setPage(this.prompt.title, this.prompt.description.slice(0, 160), '/prompts/' + id)
    }
  }

  goBack() { this.router.navigate(['/prompts']) }

  copyContent() {
    if (this.prompt?.content) {
      navigator.clipboard.writeText(this.prompt.content).then(() => {
        this.copyDone = true
        setTimeout(() => this.copyDone = false, 2000)
      })
    }
  }
}