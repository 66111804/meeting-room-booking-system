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


export const createOrUpdateBookingRoom = async (data: IBookingRoom , bookingId:number = 0) => {

  if(bookingId > 0) {
    const existingBooking = await prisma.meetingRoomBooking.findUnique({
      where: { id: bookingId }
    });

    if(!existingBooking) {
      throw new Error('Booking not found');
    }
  }

  const startTime = dayjs(data.startTime);
  const endTime = dayjs(data.endTime);

  // check if start time is before end time
  if (startTime.isAfter(endTime)) {
    throw new Error('Start time must be before end time');
  }
  // check if start time is in the past
  if (startTime.isBefore(dayjs())) {
    throw new Error('Cannot book in the past');
  }

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
      id: {not: bookingId}, // exclude current booking
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


  if(bookingId > 0){
    return prisma.meetingRoomBooking.update({
      where: { id: bookingId },
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

  booking.forEach(book => {
    const start = dayjs(book.startTime).tz("Asia/Bangkok").format('HH:mm');
    const end = dayjs(book.endTime).tz("Asia/Bangkok").format('HH:mm');

    const indexStart = baseTimeSlots.indexOf(start);
    const indexEnd = baseTimeSlots.indexOf(end);

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

  return timeSlots;
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
  const myBooking = await prisma.meetingRoomBooking.findMany({
    where:{
      userId,
      OR:[
        {
          title: {
            contains: searchTerm,
          }
        },
        {
          description: {
            contains: searchTerm,
          }
        }
      ]
    },
    include:{
      MeetingRoom: true
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy:{
      createdAt: 'desc'
    }
  });

  const total = await prisma.meetingRoomBooking.count({
    where:{
      userId,
      OR:[
        {
          title: {
            contains: searchTerm,
          }
        },
        {
          description: {
            contains: searchTerm,
          }
        }
      ]
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

interface CancelBookingParams {
  bookingId: number;
  userId: number; // current user id
  reason?: string; // optional
}

export const cancelBookingRoom = async ({ bookingId, userId, reason }: CancelBookingParams) =>
{
  try {
    // 1. check if booking exists
    const booking = await prisma.meetingRoomBooking.findUnique({
      where: { id: bookingId },
      include: {
        MeetingRoom: {
          select: {
            name: true
          }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 2. ตรวจสอบสถานะการจอง
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // 3. ตรวจสอบว่าเป็นการจองในอนาคต
    const now = dayjs();
    const bookingStartTime = dayjs(booking.startTime);

    if (bookingStartTime.isBefore(now)) {
      throw new Error('Cannot cancel past bookings');
    }

    // 4. ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของการจองเท่านั้น)
    if (booking.userId !== userId) {
      throw new Error('You do not have permission to cancel this booking');
    }

    // 5. ทำการยกเลิกการจอง
    const cancelledBooking = await prisma.meetingRoomBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        description: reason ?
          `${booking.description || ''}\n\nCancellation reason: ${reason}` :
          booking.description
      },
      include: {
        MeetingRoom: {
          select: {
            id: true,
            name: true
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      message: `Successfully cancelled booking for ${booking.MeetingRoom.name}`,
      booking: cancelledBooking
    };

  } catch (error) {
    throw error;
  }
};

/**
 * Check user is a owner of the booking
 */

export const isOwnerOfBooking = async (userId: number, bookingId: number) => {
  const booking = await prisma.meetingRoomBooking.findFirst({
    where:{
      id: bookingId,
      userId: userId
    }
  });
  // true if booking is found, false if not found
  return !!booking;
}

/**
 * Get booking by id
 * @param bookingId
 */
export const bookingById = async (bookingId: number,userId: number ) =>
{
  const info = await prisma.meetingRoomBooking.findUnique({
    where: {
      id: bookingId,
      userId: userId
    },
    include: {
      User: true,
      MeetingRoom: true
    }
  });
  if (!info) {
      return null;
  }
  return info;
};