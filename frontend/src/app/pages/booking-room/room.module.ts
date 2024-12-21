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
