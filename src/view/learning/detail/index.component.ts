import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ILearning } from 'src/types/learning'
import { learningList } from 'src/store'

@Component({
  selector: 'app-learning-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class LearningDetailComponent implements OnInit {
  item?: ILearning
  constructor(private route: ActivatedRoute, public router: Router) {}
  ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); if (id) this.item = learningList.find(s => String(s.id) === id) }
  goBack() { this.router.navigate(['/learning']) }
}