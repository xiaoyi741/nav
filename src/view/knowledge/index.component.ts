import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { knowledgeContent } from 'src/store'

@Component({
  selector: 'app-knowledge',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class KnowledgeComponent implements OnInit {
  content = knowledgeContent

  constructor(private router: Router) {}

  ngOnInit() {}
}