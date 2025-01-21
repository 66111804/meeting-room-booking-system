// src/service/bookingRoomService.ts

import { PrismaClient } from "@prisma/client";
import { baseTimeSlots, ITimeSlot } from "../shared/booking-room";
import { json } from "express";
import dayjs from "../shared/dayjs";

const prisma = new PrismaClient();

export interface IBookingRoom {
  id?: number;
  userId: number;
  meetingRoomId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status?: string;
}

export interface IBookingRoomValidation {
  meetingRoomId: number;
  startTime: string;
  endTime: string;
}


export const createBookingRoom = async (data: IBookingRoom) => {


  const startTime = dayjs(data.startTime);
  const endTime = dayjs(data.endTime);

  console.table(data.startTime);

  // check if start time is before end time
  if (startTime.isAfter(endTime)) {
    throw new Error('Start time must be before end time');
  }

  if (startTime.isBefore(dayjs())) {
    throw new Error('Cannot book in the past');
  }

  console.table({startTime, endTime});
  const startDateTime = new Date();
  startDateTime.setHours(startTime.hour(), startTime.minute(), 0, 0);

  const endDateTime = new Date();
  endDateTime.setHours(endTime.hour(), endTime.minute(), 0, 0);

  // check if start time is before end time
  const startSlot = await prisma.slotTime.findFirst({
    where: {
      startTime: {
        equals: startDateTime
      }
    }
  });

  const endSlot = await prisma.slotTime.findFirst({
    where: {
      endTime: {
        equals: endDateTime
      }
    }
  });

  if (!startSlot || !endSlot) {
    throw new Error('Booking time must match with available time slots');
  }

  // check if booking time is between 08:00-18:00
  const businessStartTime = startTime.clone().startOf('day').add(8, 'hours');
  const businessEndTime = startTime.clone().startOf('day').add(18, 'hours');

  if (startTime.isBefore(businessStartTime) || endTime.isAfter(businessEndTime)) {
    throw new Error('Booking time must be between 08:00-18:00');
  }

  // check if booking time is at :00 or :30 minute marks
  const startMinutes = startTime.minute();
  const endMinutes = endTime.minute();
  if ((startMinutes !== 0 && startMinutes !== 30) ||
    (endMinutes !== 0 && endMinutes !== 30)) {
    throw new Error('Booking time must be at :00 or :30 minute marks');
  }

  // check if room is available
  const overlappingSlots = await prisma.slotTime.findMany({
    where: {
      AND: [
        {
          startTime: {
            gte: startDateTime,
            lt: endDateTime
          }
        },
        { isActive: true }
      ]
    }
  });
  if(overlappingSlots.length === 0){
    throw new Error('Booking time must match with available time slots');
  }
  // check if room is available
  const conflicts = await prisma.meetingRoomBooking.findMany({
    where: {
      meetingRoomId: data.meetingRoomId,
      status: 'confirmed',
      OR: [
        {
          AND: [
            { startTime: { lte: startTime.toDate() } },
            { endTime: { gt: startTime.toDate() } }
          ]
        },
        {
          AND: [
            { startTime: { lt: endTime.toDate() } },
            { endTime: { gte: endTime.toDate() } }
          ]
        },
        {
          AND: [
            { startTime: { gte: startTime.toDate() } },
            { endTime: { lte: endTime.toDate() } }
          ]
        }
      ]
    },
    include: {
      MeetingRoom: {
        select: { name: true }
      }
    }
  });

  if (conflicts.length > 0) {
    const conflictRoom = conflicts[0].MeetingRoom.name;
    throw new Error(`Room "${conflictRoom}" is already booked during this time period`);
  }

  return prisma.meetingRoomBooking.create({
    data: {
      ...data,
      startTime: startTime.toDate(),
      endTime: endTime.toDate(),
      status: 'confirmed'
    },
    include: {
      MeetingRoom: true,
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    }
  });

  // create booking
  /*
  // remove endTime -1 minute
  const endTimeSub = dayjs(data.endTime).tz("Asia/Bangkok").subtract(1, 'minute').format();

  console.table({startTime, endTimeSub});
  const conflicts = await prisma.meetingRoomBooking.findMany({
    where:{
      meetingRoomId: data.meetingRoomId,
      status: 'confirmed',
      OR: [
        {
          startTime: { gte: startTime },
          endTime: { lte: endTimeSub },
        },
      ]
    }
  })

  console.table({conflicts});

    if(conflicts.length > 0){
      throw new Error('This room is already booked for this time');
    }

    // add status confirmed
    data.status = 'confirmed';

    return prisma.meetingRoomBooking.create({
      data:{
        ...data,
        startTime,
        endTime
      }
    });

   */
};

export const listBookingRoom = async (meetingRoomId:number,date:string) => {
  const dateStart = dayjs(date).tz("Asia/Bangkok").startOf('day').toDate();
  const dateEnd = dayjs(date).tz("Asia/Bangkok").endOf('day').toDate();

  const booking = await prisma.meetingRoomBooking.findMany({
    where:{
      meetingRoomId,
      status: 'confirmed',
      OR: [
        {
          startTime: { gte: dateStart, lte: dateEnd },
        },
        {
          endTime: { gte: dateStart, lte: dateEnd },
        },
        {
          startTime: { lte: dateStart },
          endTime: { gte: dateEnd },
        },
      ],
    },
    include:
      {
        User: true
      },
    orderBy:{startTime: 'asc'}
  });

  const timeSlots:ITimeSlot[] = [];

  baseTimeSlots.forEach(time => {
    timeSlots.push({
      time,
      available: true
    });
  });


  // export const baseTimeSlots: string[] = [
  //   '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  //   '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  //   '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  //   '17:00', '17:30', '18:00'
  // ];
  booking.forEach(book => {
    const start = dayjs(book.startTime).tz("Asia/Bangkok").format('HH:mm');
    const end = dayjs(book.endTime).tz("Asia/Bangkok").format('HH:mm');

    const indexStart = baseTimeSlots.indexOf(start);
    const indexEnd = baseTimeSlots.indexOf(end);

    console.table({start, end, indexStart, indexEnd});

    for(let i = indexStart; i < indexEnd; i++){
      timeSlots[i].available = false;
      let bookingUserRemovePassword = book.User;
      const userWithoutPassword = { ...bookingUserRemovePassword, password: undefined };
      timeSlots[i].booking = {
        ...book,
        startTime: dayjs(book.startTime).tz("Asia/Bangkok").format('HH:mm'),
        endTime: dayjs(book.endTime).tz("Asia/Bangkok").format('HH:mm'),
        User: userWithoutPassword
      }
    }
  });

  // console.table(timeSlots);
  return timeSlots;
};


export const cancelBookingRoom = async (id: number) => {
  return prisma.meetingRoomBooking.update({
    where:{
      id
    },
    data:{
      status: 'cancelled'
    }
  })
};

export const updateBookingRoom = async (id: number, data: IBookingRoom) => {
  const startTime = dayjs(data.startTime).tz("Asia/Bangkok").format();
  const endTime = dayjs(data.endTime).tz("Asia/Bangkok").format();
  const conflicts = await prisma.meetingRoomBooking.findMany({
    where:{
      meetingRoomId: data.meetingRoomId,
      status: 'confirmed',
      OR: [
        {
          startTime: { gte: startTime }, // greater than or equal
          endTime: { lte: endTime }, // less than or equal
        },
      ],
      NOT:{
        id
      }
    }
  })

  if(conflicts.length > 0){
    throw new Error('This room is already booked for this time');
  }

  return prisma.meetingRoomBooking.update({
    where:{
      id
    },
    data
  });
};

export const validateBookingRoom = async (data: IBookingRoomValidation) => {

  const timeStart = dayjs(data.startTime).tz("Asia/Bangkok").format();
  const timeEnd = dayjs(data.endTime).tz("Asia/Bangkok").format();
  const roomId = data.meetingRoomId;

  const conflicts = await prisma.meetingRoomBooking.findMany({
    where:{
      meetingRoomId: roomId,
      status: 'confirmed',
      OR: [
        {
          startTime: { gte: timeStart },
          endTime: { lte: timeEnd },
        },
      ],
    }
  });

  if(conflicts.length > 0){
    throw new Error('This room is already booked for this time');
  }

  return true; // no conflict
};

// ------------------------ My Booking ------------------------ //
export const myBooking = async (userId: number, page: number, limit: number, searchTerm: string) =>{

  // ({ meetingRooms:meetingRoomsList, total, totalPages, current: page });
  const myBooking = await prisma.meetingRoomBooking.findMany({
    where:{
      userId
    },
    include:{
      MeetingRoom: true
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy:{
      updatedAt: 'desc'
    }
  });

  const total = await prisma.meetingRoomBooking.count({
    where:{
      userId
    }
  });

  const totalPages = Math.ceil(total / limit);

  return {
    myBooking,
    total,
    totalPages,
    current: page
  };
};