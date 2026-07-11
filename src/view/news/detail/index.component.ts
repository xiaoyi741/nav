import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { INews } from 'src/types/news'
import { newsList } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-news-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class NewsDetailComponent implements OnInit {
  news?: INews
  constructor(private route: ActivatedRoute, public router: Router, private seo: SeoService) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.news = newsList.find(s => String(s.id) === id)
      if (this.news) this.seo.setPage(this.news.title, this.news.description.slice(0, 160), '/news/' + id)
    }
  }
  goBack() { this.router.navigate(['/news']) }
}