export interface ILearning {
  id: string | number
  title: string
  description: string
  content?: string
  tags?: string[]
  createdAt: string | number
  readCount?: number
  updatedAt?: string | number
}