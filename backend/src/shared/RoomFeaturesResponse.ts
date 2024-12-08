export interface RoomFeaturesResponse
{
  features: Feature[]
  total: number
  totalPages: number
  current: number
}

export interface Feature {
  id: number
  name: string
  selected?: boolean
  createdAt: string
  updatedAt: string
}
