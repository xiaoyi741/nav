import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IPrompt } from 'src/types/prompts'
import { promptsList } from 'src/store'

@Component({
  selector: 'app-prompts-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class PromptsDetailComponent implements OnInit {
  prompt?: IPrompt
  copyDone = false

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) this.prompt = promptsList.find(s => String(s.id) === id)
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