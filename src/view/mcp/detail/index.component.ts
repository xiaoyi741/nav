import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IMCP } from 'src/types/mcp'
import { mcpList } from 'src/store'

@Component({
  selector: 'app-mcp-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class McpDetailComponent implements OnInit {
  mcp?: IMCP
  constructor(private route: ActivatedRoute, public router: Router) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) this.mcp = mcpList.find(s => String(s.id) === id)
  }
  goBack() { this.router.navigate(['/mcp']) }
  goToDetail(id: string | number) { this.router.navigate(['/mcp', id]) }
}