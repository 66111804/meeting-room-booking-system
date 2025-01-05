export interface ITimeSlot {
  time: string;
  available: boolean;
  booking?: any;
}


export interface IBookingRoom {
  meetingRoomId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}

export interface IBookingRoomValidation {
  meetingRoomId: number;
  startTime: string;
  endTime: string;
}


export interface IMyBookingsResponse {
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
