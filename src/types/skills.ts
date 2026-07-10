// Skills 数据类型定义
export interface ISkill {
  id: string | number
  name: string
  description: string
  content?: string        // SKILL.md 完整内容
  tags: string[]
  githubUrl?: string
  installCmd?: string
  relatedIds?: (string | number)[]
  createdAt: string | number
  updatedAt?: string | number
  ownVisible?: boolean
}
