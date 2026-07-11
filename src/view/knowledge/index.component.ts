import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { knowledgeContent } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-knowledge',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class KnowledgeComponent implements OnInit {
  content = knowledgeContent

  constructor(private router: Router, private seo: SeoService) {}

  ngOnInit() {
    this.seo.setPage('AI知识库', '完全免费开放的 AI 知识共享平台，减少信息差', '/knowledge')
  }
}