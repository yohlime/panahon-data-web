export type Paginated<T> = {
  page: number
  per_page: number
  total: number
  data: T[]
}
