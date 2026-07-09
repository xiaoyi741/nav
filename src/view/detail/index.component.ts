// 开源项目，仅供学习参考
// YiGo-Ai导航 详情页

import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Title, Meta } from '@angular/platform-browser'
import { websiteList, settings } from 'src/store'
import { IWebProps, INavProps } from 'src/types'
import { JumpService } from 'src/services/jump'
import { getTextContent } from 'src/utils'
import { $t } from 'src/locale'

@Component({
  selector: 'app-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class DetailComponent implements OnInit, OnDestroy {
  tool: IWebProps | null = null
  relatedTools: IWebProps[] = []
  loading = true
  notFound = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    public jumpService: JumpService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id'])
      this.findTool(id)
    })
  }

  ngOnDestroy() {
    // 恢复默认标题
  }

  findTool(id: number) {
    this.loading = true
    this.notFound = false
    this.tool = null
    this.relatedTools = []

    // 遍历所有分类查找工具
    for (const cat of websiteList) {
      for (const sub of cat.nav || []) {
        for (const group of sub.nav || []) {
          for (const item of group.nav || []) {
            if (Number(item.id) === id) {
              this.tool = item
              break
            }
          }
          if (this.tool) break
        }
        if (this.tool) break
      }
      if (this.tool) break
    }

    if (this.tool) {
      // 更新SEO
      const name = getTextContent(this.tool.name || '')
      const desc = getTextContent(this.tool.desc || '')
      this.titleService.setTitle(`${name} - YiGo-Ai导航`)
      this.metaService.updateTag({ name: 'description', content: desc || `${name} AI工具介绍` })
      this.metaService.updateTag({ name: 'keywords', content: `${name},AI工具,${name}官网` })

      // 获取同类推荐
      this.getRelatedTools()
    } else {
      this.notFound = true
      this.titleService.setTitle('工具未找到 - YiGo-Ai导航')
    }

    this.loading = false
  }

  getRelatedTools() {
    // 找到同分类的其他工具作为推荐
    for (const cat of websiteList) {
      for (const sub of cat.nav || []) {
        for (const group of sub.nav || []) {
          for (const item of group.nav || []) {
            if (this.relatedTools.length >= 6) break
            if (Number(item.id) !== Number(this.tool?.id)) {
              this.relatedTools.push(item)
            }
          }
        }
      }
    }
  }

  goBack() {
    window.history.back()
  }

  goExternal(url: string | undefined | null) {
    if (url) {
      this.jumpService.goUrl(null, url)
    }
  }
}
