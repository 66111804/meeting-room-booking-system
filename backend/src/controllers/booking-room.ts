// noinspection DuplicatedCode

import { PrismaClient } from "@prisma/client";
import {
  cancelBookingRoom,
  createBookingRoom, IBookingRoom,
  listBookingRoom,
  updateBookingRoom
} from "../service/bookingRoomService";
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
    console.log(error.message);

    return res.status(500).json({ message: error.message });
  }
};


export const createMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const data:IBookingRoom = req.body;
    data.userId = req.user.id;
    console.log(data);
    const booking = await createBookingRoom(data);
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
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
}

export const updateMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({ message: "Id is required" });
    }
    const booking = await updateBookingRoom(parseInt(id), req.body);
    return res.status(200).json(booking);
  } catch (error:any) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
};

export const cancelMeetingRoomBooking = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({ message: "Id is required" });
    }
    const booking = await cancelBookingRoom(parseInt(id));
    return res.status(200).json(booking);
  } catch (error:any) {
    console.log(error.message);
    return res.status(400).json({ message: error.message });
  }
}