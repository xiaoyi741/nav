// SEO 服务：动态设置页面标题、描述、OG 标签
import { Injectable } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'

@Injectable({ providedIn: 'root' })
export class SeoService {
  private baseUrl = 'http://nav.yigoai.cn'

  constructor(private title: Title, private meta: Meta) {}

  setPage(title: string, description: string, path: string, image?: string, keywords?: string) {
    const fullTitle = title + ' - YiGo-Ai导航'
    const url = this.baseUrl + path
    const img = image || this.baseUrl + '/assets/logo.png'
    // 默认关键词 + 长尾关键词
    const defaultKw = 'AI导航,AI工具,人工智能,YiGo-Ai导航'
    const kw = keywords ? defaultKw + ',' + keywords : defaultKw + ',' + title

    this.title.setTitle(fullTitle)
    this.meta.updateTag({ name: 'description', content: description })
    this.meta.updateTag({ name: 'keywords', content: kw })
    this.meta.updateTag({ property: 'og:title', content: fullTitle })
    this.meta.updateTag({ property: 'og:description', content: description })
    this.meta.updateTag({ property: 'og:image', content: img })
    this.meta.updateTag({ property: 'og:url', content: url })
    this.meta.updateTag({ property: 'og:type', content: 'website' })
    this.meta.updateTag({ property: 'og:site_name', content: 'YiGo-Ai导航' })
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' })
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle })
    this.meta.updateTag({ name: 'twitter:description', content: description })
    this.meta.updateTag({ name: 'twitter:image', content: img })
    this.meta.updateTag({ rel: 'canonical', href: url })
  }
}