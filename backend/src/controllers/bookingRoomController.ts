// src/controllers/bookingRoomController.ts

import { PrismaClient } from "@prisma/client";
import {
  bookingById,
  cancelBookingRoom,
  createOrUpdateBookingRoom, IBookingRoom, isOwnerOfBooking,
  listBookingRoom, myBooking,
  validateBookingRoom
} from "../service/bookingRoomService";
import { uploadDir } from "../shared/uploadFile";
import dayjs from "dayjs";
import { startOfDay } from "date-fns";
const prisma = new PrismaClient();

const isTimeOverlap = (existingBooking: any, searchTimeStart: string, searchTimeEnd: string) => {

  const bookingStart = dayjs(existingBooking.startTime).format('HH:mm');
  const bookingEnd = dayjs(existingBooking.endTime).format('HH:mm');

  const [searchStartHour, searchStartMin] = searchTimeStart.split(':').map(Number);
  const [searchEndHour, searchEndMin] = searchTimeEnd.split(':').map(Number);
  const [bookingStartHour, bookingStartMin] = bookingStart.split(':').map(Number);
  const [bookingEndHour, bookingEndMin] = bookingEnd.split(':').map(Number);

  const searchStartMinutes = searchStartHour * 60 + searchStartMin;
  const searchEndMinutes = searchEndHour * 60 + searchEndMin;
  const bookingStartMinutes = bookingStartHour * 60 + bookingStartMin;
  const bookingEndMinutes = bookingEndHour * 60 + bookingEndMin;

  return !(searchEndMinutes <= bookingStartMinutes || searchStartMinutes >= bookingEndMinutes);
};

export const meetingRoomList = async (req: any, res: any) => {
  try {
    // noinspection DuplicatedCode
    let { page, limit, search ,date , timeStart , timeEnd} = req.query;
    const { id } = req.params;
    // const token = req.headers.authorization.split(" ")[1];
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    date = date || dayjs().format("YYYY-MM-DD"); // default today

    const selectedDate = dayjs(date);
    const startOfDay = selectedDate.startOf('day');

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search },},
          { description: { startsWith: search },},
        ]
      };

    }
    if (id) {
      where = {
        ...where,
        id: parseInt(id),
      }
    }

    // add where status = active
    where = {
      ...where,
      status: "active",
    };

    const meetingRoomsList = await prisma.meetingRoom.findMany({
      where,
      include: {
        roomHasFeatures: {
          include: {
            feature: true
          }
        },
        meetingRoomBooking: {
          where: {
            AND: [
              {
                status: 'confirmed'
              },
              {OR: [
                  {
                    startTime: {
                      gte: startOfDay.toDate(),
                      lt: startOfDay.add(1, 'day').toDate()
                    }
                  },
                  {
                    AND: [
                      { startTime: { lt: startOfDay.toDate() } },
                      { endTime: { gt: startOfDay.toDate() } }
                    ]
                  }]
              }
            ]
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      }
    });
    const formattedRooms = meetingRoomsList.map(room => {
      const hasOverlap = room.meetingRoomBooking.some(booking =>
        isTimeOverlap(booking, timeStart, timeEnd)
      );

      const isAvailable = !hasOverlap; // if there is no overlap, then it's available

      const bookings = room.meetingRoomBooking.map(booking => ({
        id: booking.id,
        title: booking.title,
        startTime: dayjs(booking.startTime).format('HH:mm'),
        endTime: dayjs(booking.endTime).format('HH:mm'),
        bookedBy: booking.User.name
      }));

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        imageUrl: room.imageUrl,
        status: room.status,
        isAvailable,
        bookings,
        roomHasFeatures: room.roomHasFeatures.map(f => ({
          id: f.feature.id,
          name: f.feature.name
        }))
      };
    });

    const total = await prisma.meetingRoom.count({ where });
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json(
      {
        meetingRooms:formattedRooms,
        total,
        totalPages,
        current: page ,
        date: date
      });

  } catch (error:any) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const data:IBookingRoom = req.body;
    data.userId = req.user.id;
    // return res.status(200).json(data);

    const booking = await createOrUpdateBookingRoom(data);
    return res.status(201).json(booking);
  }catch (error:any) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
};

export const getMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const { id } = req.params; // booking id
    if(!id){
      return res.status(400).json({ message: "Id is required" });
    }
    const date = req.query.date;
    if(!date){
      return res.status(400).json({ message: "Date is required" });
    }

    const booking = await listBookingRoom(parseInt(id), date);
    return res.status(200).json(booking);
  } catch (error:any) {
    console.error(error.message);
    return res.status(400).json({ message: error.message });
  }
}

export const IsValidateBookingRoom = async (req: any, res: any) => {
  try {
    const isValid = await validateBookingRoom(req.body);
    return res.status(200).json({ isValid });
  }catch (error:any) {
    console.error(error.message);
    return res.status(400).json({ message: error.message, isValid: false });
  }

};

// ------------------------ My Booking ------------------------ //
export const getMyBooking = async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    let { page, limit, searchTerm } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const bookings = await myBooking(userId, page, limit, searchTerm);
    return res.status(200).json(bookings);
  } catch (error:any) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------ cancel booking ------------------------ //
export const cancelMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const { id } = req.params;          // booking id
    const { reason } = req.body;        // เหตุผลการยกเลิก (optional)
    const userId = req.user.id;         // id ของผู้ใช้ที่ต้องการยกเลิก

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    // check if userId is the owner of the booking

    const isOwner = isOwnerOfBooking(userId, parseInt(id));
    if (!isOwner) {
      return res.status(401).json({
        success: false,
        message: "You are not the owner of this booking"
      });
    }

    const result = await cancelBookingRoom({
      bookingId: parseInt(id),
      userId,
      reason
    });

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ------------------------ get booking by id ------------------------ //
export const getBookingById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }
    console.log({id, userId});

    const booking = await bookingById(parseInt(id));
    return res.status(200).json({
      success: true,
      booking,
      message: "Information retrieved successfully"
    });

  } catch (error: any) {
    console.error('Error getting booking:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ------------------------ update booking ------------------------ //
export const updateBooking = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data:IBookingRoom = req.body;
    data.userId = req.user.id;
    const isOwner = await isOwnerOfBooking(data.userId, parseInt(id));
    if (!isOwner) {
      return res.status(401).json({
        success: false,
        message: "You are not the owner of this booking"
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    const booking = await createOrUpdateBookingRoom(data, parseInt(id));
    return res.status(200).json({
      success: true,
      booking,
      message: "Booking updated successfully"
    });

  } catch (error: any) {
    console.error('Error updating booking:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}