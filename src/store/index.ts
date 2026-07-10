// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// YiGo-Ai导航 仅供学习参考

import dbJson from '../../data/db.json'
import searchJson from '../../data/search.json'
import settingsJson from '../../data/settings.json'
import tagJson from '../../data/tag.json'
import internalJson from '../../data/internal.json'
import componentJson from '../../data/component.json'
import skillsJson from '../../data/skills.json'
import promptsJson from '../../data/prompts.json'
import newsJson from '../../data/news.json'
import mcpJson from '../../data/mcp.json'
import knowledgeJson from '../../data/knowledge.json'
import learningJson from '../../data/learning.json'
import {
  ISettings,
  ISearchEngineProps,
  ITagProp,
  internalProps,
  ITagPropValues,
  INavProps,
  IComponentProps,
} from 'src/types'
import { ISkill } from 'src/types/skills'
import { IPrompt } from 'src/types/prompts'
import { INews } from 'src/types/news'
import { IMCP } from 'src/types/mcp'
import { ILearning } from 'src/types/learning'
import { isSelfDevelop } from 'src/utils/util'

export let settings: ISettings = settingsJson as ISettings

let _tagMap: Record<string, any> = {}

export let searchEngineList: ISearchEngineProps[] = isSelfDevelop
  ? []
  : searchJson

export let tagList: Array<ITagPropValues> = isSelfDevelop ? [] : tagJson

export function getTagMap() {
  tagList.forEach((item) => {
    if (item.id) {
      _tagMap[item.id] = {
        ...item,
      }
    }
  })
  return _tagMap
}
getTagMap()

export let tagMap: ITagProp = _tagMap

export let internal: internalProps = internalJson

export let websiteList: INavProps[] = isSelfDevelop
  ? []
  : (dbJson as unknown as INavProps[])

export let skillsList: ISkill[] = isSelfDevelop ? [] : (skillsJson as ISkill[])

export let promptsList: IPrompt[] = isSelfDevelop ? [] : (promptsJson as IPrompt[])

export let newsList: INews[] = isSelfDevelop ? [] : (newsJson as INews[])

export let mcpList: IMCP[] = isSelfDevelop ? [] : (mcpJson as IMCP[])

export const knowledgeContent: string = knowledgeJson.content || ''

export let learningList: ILearning[] = isSelfDevelop ? [] : (learningJson as ILearning[])

export let components: IComponentProps[] = isSelfDevelop ? [] : componentJson
