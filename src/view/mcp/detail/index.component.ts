import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IMCP } from 'src/types/mcp'
import { mcpList } from 'src/store'
import { SeoService } from 'src/services/seo.service'

@Component({
  selector: 'app-mcp-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class McpDetailComponent implements OnInit {
  mcp?: IMCP
  constructor(private route: ActivatedRoute, public router: Router, private seo: SeoService) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.mcp = mcpList.find(s => String(s.id) === id)
      if (this.mcp) this.seo.setPage(this.mcp.name, this.mcp.description.slice(0, 160), '/mcp/' + id)
    }
  }
  goBack() { this.router.navigate(['/mcp']) }
  goToDetail(id: string | number) { this.router.navigate(['/mcp', id]) }
}