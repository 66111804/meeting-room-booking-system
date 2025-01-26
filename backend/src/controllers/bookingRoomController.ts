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
const prisma = new PrismaClient();

export const meetingRoomList = async (req: any, res: any) => {
  try {
    let { page, limit, search } = req.query;
    const { id } = req.params;
    // const token = req.headers.authorization.split(" ")[1];
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
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
      include:{
        roomHasFeatures:{
          include:{
            feature: true
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const total = await prisma.meetingRoom.count({ where });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({ meetingRooms:meetingRoomsList, total, totalPages, current: page });
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
//
// export const updateMeetingRoomBooking = async (req: any, res: any) => {
//   try {
//     const { id } = req.params;
//     if(!id){
//       return res.status(400).json({ message: "Id is required" });
//     }
//     const booking = await createOrUpdateBookingRoom(parseInt(id), req.body);
//     return res.status(200).json(booking);
//   } catch (error:any) {
//     console.error(error.message);
//     return res.status(400).json({ message: error.message });
//   }
// };

// export const cancelMeetingRoomBooking = async (req: any, res: any) => {
//   try {
//     const { id } = req.params;
//     if(!id){
//       return res.status(400).json({ message: "Id is required" });
//     }
//     const booking = await cancelBookingRoom(parseInt(id));
//     return res.status(200).json(booking);
//   } catch (error:any) {
//     console.log(error.message);
//     return res.status(400).json({ message: error.message });
//   }
// }

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
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const bookings = await myBooking(userId, page, limit, search);
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