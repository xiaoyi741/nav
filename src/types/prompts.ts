export interface IPrompt {
  id: string | number
  title: string
  description: string
  content?: string
  tags: string[]
  author?: string
  createdAt: string | number
  readCount?: number
  updatedAt?: string | number
  ownVisible?: boolean
}