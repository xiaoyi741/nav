import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { INews } from 'src/types/news'
import { newsList } from 'src/store'

@Component({
  selector: 'app-news-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class NewsDetailComponent implements OnInit {
  news?: INews
  constructor(private route: ActivatedRoute, public router: Router) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) this.news = newsList.find(s => String(s.id) === id)
  }
  goBack() { this.router.navigate(['/news']) }
}