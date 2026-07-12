// SEO 服务：动态设置页面标题、描述、OG 标签
import { Injectable } from '@angular/core'
import { Title, Meta } from '@angular/platform-browser'

@Injectable({ providedIn: 'root' })
export class SeoService {
  private baseUrl = 'https://nav.yigoai.cn'

  constructor(private title: Title, private meta: Meta) {}

  setPage(title: string, description: string, path: string, image?: string, keywords?: string) {
    const fullTitle = title + ' - YiGo-Ai导航'
    const url = this.baseUrl + path
    const img = image || this.baseUrl + '/assets/logo.png'
    // 默认关键词 + 长尾关键词
    const defaultKw = 'AI导航,AI工具导航,AI导航网站,人工智能工具导航,AI工具大全,AI网址导航,AI工具集合,AI导航站,YiGo-Ai导航,免费AI工具,在线AI工具,AI工具推荐,AI工具导航站'
    var kw = defaultKw
    if (keywords) {
      kw = defaultKw + ',' + keywords
    } else if (path === '/') {
      kw = defaultKw + ',AI写作工具,AI绘画工具,AI视频生成,AI编程助手,AI办公工具,AI聊天机器人,AI大模型,AI智能体,AI提示词,AI学习资源,AI资讯,AI知识库,MCP服务器,Agent Skills,AI工具排行榜,AI导航站点'
    } else {
      kw = defaultKw + ',' + title
    }

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