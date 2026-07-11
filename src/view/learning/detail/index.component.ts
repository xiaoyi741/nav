import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ILearning } from 'src/types/learning'
import { learningList } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-learning-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class LearningDetailComponent implements OnInit {
  item?: ILearning
  constructor(private route: ActivatedRoute, public router: Router, private seo: SeoService) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.item = learningList.find(s => String(s.id) === id)
      if (this.item) this.seo.setPage(this.item.title, this.item.description.slice(0, 160), '/learning/' + id)
    }
  }
  goBack() { this.router.navigate(['/learning']) }
}