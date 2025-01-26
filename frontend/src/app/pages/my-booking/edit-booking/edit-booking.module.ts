export interface IBookingRoomInfoResponse
{
  success: boolean
  booking: IBookingInfo
  message: string
}

export interface IBookingInfo {
  id: number
  userId: number
  meetingRoomId: number
  slotTimeId: any
  title: string
  description: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
  updatedAt: string
  User: IUser
  MeetingRoom: IMeetingRoom
}

export interface IUser {
  id: number
  employeeId: string
  email: string
  name: string
  lastName: string
  password: string
  avatar: any
  dateEmployment: string
  position: string
  department: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface IMeetingRoom {
  id: number
  name: string
  description: string
  capacity: number
  imageUrl: string
  status: string
  createdAt: string
  updatedAt: string
}
