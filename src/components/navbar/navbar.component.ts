// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// YiGo-Ai导航 仅供学习参考
// See https://github.com/xiaoyi741/nav

import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { settings } from 'src/store'
import { $t } from 'src/locale'
import { filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'

export interface NavItem {
  label: string
  icon?: string
  /** 在主题视图中的 page 参数（用于没独立路由的分类） */
  page?: number
  /** 独立路由（用于有独立页面的分类，如 Skills） */
  route?: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  settings = settings
  mobileOpen = false

  navItems: NavItem[] = [
    { label: 'AI导航', page: 0 },
    { label: 'AI工具', page: 1 },
    { label: 'AI知识库', page: 2 },
    { label: 'AI提示词', route: '/prompts' },
    { label: 'MCP', page: 4 },
    { label: 'Skills', route: '/skills' },
    { label: 'AI学习资源', page: 6 },
    { label: 'AI资讯', page: 7 },
    { label: '开源排行榜', page: 8 },
  ]

  /** 当前激活的菜单索引 */
  activeIndex = 0
  private routerSub!: Subscription

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncActiveState()
      })

    this.syncActiveState()
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe()
    }
  }

  /**
   * 根据当前 URL 同步激活状态
   */
  private syncActiveState() {
    const url = this.router.url.split('?')[0]

    // 先匹配独立路由
    for (let i = 0; i < this.navItems.length; i++) {
      const item = this.navItems[i]
      if (item.route && url.startsWith(item.route)) {
        this.activeIndex = i
        this.cdr.markForCheck()
        return
      }
    }

    // 再匹配 page 参数
    const params = new URLSearchParams(this.router.url.split('?')[1])
    const page = parseInt(params.get('page') || '0', 10)
    if (!isNaN(page) && page >= 0 && page < this.navItems.length) {
      this.activeIndex = page
    } else {
      this.activeIndex = 0
    }
    this.cdr.markForCheck()
  }

  /**
   * 获取内容视图的基础路径
   */
  private getContentViewBasePath(): string {
    const path = this.router.url.split('?')[0].replace(/^\//, '').split('/')[0] || ''
    const validThemes = ['light', 'super', 'sim', 'side', 'shortcut', 'app']
    if (validThemes.includes(path)) {
      return '/' + path
    }
    return '/' + (settings.theme || 'light').toLowerCase()
  }

  navigateTo(item: NavItem, event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    this.mobileOpen = false
    this.activeIndex = this.navItems.indexOf(item)
    this.cdr.markForCheck()

    if (item.route) {
      // 有独立路由 → 直接跳转
      this.router.navigate([item.route])
    } else if (item.page !== undefined) {
      // 用 page 参数跳转到当前主题视图
      this.router.navigate([this.getContentViewBasePath()], {
        queryParams: {
          page: item.page,
          id: 0,
          _: Date.now(),
        },
      })
    }
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen
    this.cdr.markForCheck()
  }

  isActive(item: NavItem): boolean {
    return this.navItems.indexOf(item) === this.activeIndex
  }
}
