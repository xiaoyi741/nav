// 开源项目，仅供学习参考
// YiGo-Ai导航 详情页（带主站框架）

import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Title, Meta } from '@angular/platform-browser'
import { websiteList, settings } from 'src/store'
import { IWebProps, INavProps } from 'src/types'
import { JumpService } from 'src/services/jump'
import { CommonService } from 'src/services/common'
import { getTextContent, isMobile } from 'src/utils'
import { setWebsiteList } from 'src/utils/web'
import { $t } from 'src/locale'
import { STORAGE_KEY_MAP } from 'src/constants'
import { isSelfDevelop } from 'src/utils/util'

@Component({
  selector: 'app-detail',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export default class DetailComponent implements OnInit, OnDestroy {
  $t = $t
  tool: IWebProps | null = null
  relatedTools: IWebProps[] = []
  loading = true
  notFound = false
  jsonLd: string = ''
  websiteList: INavProps[] = websiteList
  isCollapsed = isMobile() || settings.sideCollapsed

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    public jumpService: JumpService,
    public commonService: CommonService,
  ) {
    const localCollapsed = localStorage.getItem(STORAGE_KEY_MAP.sideCollapsed)
    if (localCollapsed) {
      this.isCollapsed = localCollapsed === 'true'
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id'])
      this.findTool(id)
    })
  }

  ngOnDestroy() {
  }

  findTool(id: number) {
    this.loading = true
    this.notFound = false
    this.tool = null
    this.relatedTools = []
    this.jsonLd = ''

    for (const cat of this.websiteList) {
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
      const name = getTextContent(this.tool.name || '')
      const desc = getTextContent(this.tool.desc || '')
      const pageTitle = `${name} - YiGo-Ai导航`
      const pageUrl = window.location.href
      const imgUrl = this.tool.icon || window.location.origin + '/nav/assets/logo.png'

      this.titleService.setTitle(pageTitle)
      this.metaService.updateTag({ name: 'description', content: desc || `${name} AI工具介绍和官网` })
      this.metaService.updateTag({ name: 'keywords', content: `${name},AI工具,${name}官网` })
      this.metaService.updateTag({ property: 'og:title', content: pageTitle })
      this.metaService.updateTag({ property: 'og:description', content: desc || `${name} AI工具介绍` })
      this.metaService.updateTag({ property: 'og:image', content: imgUrl })
      this.metaService.updateTag({ property: 'og:url', content: pageUrl })
      this.metaService.updateTag({ property: 'og:type', content: 'website' })
      this.metaService.updateTag({ property: 'og:site_name', content: 'YiGo-Ai导航' })
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' })
      this.metaService.updateTag({ name: 'twitter:title', content: pageTitle })
      this.metaService.updateTag({ name: 'twitter:description', content: desc || `${name} AI工具介绍` })
      this.metaService.updateTag({ name: 'twitter:image', content: imgUrl })

      const richDesc = this.tool['richDesc'] || ''
      const cleanDesc = richDesc ? richDesc.replace(/<[^>]*>/g, '').substring(0, 500) : desc

      const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: name,
        url: this.tool.url || pageUrl,
        description: cleanDesc,
        applicationCategory: 'Multimedia',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
      }
      this.jsonLd = JSON.stringify(ld, null, 2)

      this.getRelatedTools()
    } else {
      this.notFound = true
      this.titleService.setTitle('工具未找到 - YiGo-Ai导航')
    }
    this.loading = false
  }

  getRelatedTools() {
    for (const cat of this.websiteList) {
      for (const sub of cat.nav || []) {
        for (const group of sub.nav || []) {
          for (const item of group.nav || []) {
            if (this.relatedTools.length >= 8) break
            if (Number(item.id) !== Number(this.tool?.id)) {
              this.relatedTools.push(item)
            }
          }
        }
      }
    }
  }

  get nzXXl(): number {
    return 4
  }

  openMenu(item: any, index: number) {
    this.websiteList.forEach((data, idx) => {
      if (idx === index) {
        data.collapsed = !data.collapsed
      } else {
        data.collapsed = false
      }
    })
    if (!isSelfDevelop) {
      setWebsiteList(this.websiteList)
    }
  }

  handleCollapsed() {
    this.isCollapsed = !this.isCollapsed
    localStorage.setItem(STORAGE_KEY_MAP.sideCollapsed, String(this.isCollapsed))
  }

  goBack() {
    window.history.back()
  }

  goExternal(url: string | undefined | null) {
    if (url) {
      this.jumpService.goUrl(null, url)
    }
  }

  trackById(index: number, item: any) {
    return item.id
  }

  toNumber(val: any): number {
    return Number(val)
  }
}
