export interface IMCP {
  id: string | number
  name: string
  description: string
  content?: string
  tags: string[]
  githubUrl?: string
  createdAt: string | number
  updatedAt?: string | number
  ownVisible?: boolean
}