export interface ITimeSlot {
  time: string;
  available: boolean;
  booking?: any;
}

export const baseTimeSlots: string[] = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];


export interface IBookingsResponse {
  myBooking: MyBooking[]
  total: number
  totalPages: number
  current: number
}

export interface MyBooking {
  id: number
  userId: number
  meetingRoomId: number
  title: string
  description: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
  updatedAt: string
  MeetingRoom: MeetingRoom
}

export interface MeetingRoom {
  id: number
  name: string
  description: string
  capacity: number
  imageUrl: string
  status: string
  createdAt: string
  updatedAt: string
}