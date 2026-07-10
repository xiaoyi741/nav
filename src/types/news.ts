export interface INews {
  id: string | number
  title: string
  description: string
  content?: string
  author?: string
  createdAt: string | number
  readCount?: number
  sourceUrl?: string
  tags?: string[]
  updatedAt?: string | number
  ownVisible?: boolean
}