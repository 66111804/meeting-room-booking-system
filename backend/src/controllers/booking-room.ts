import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../core/config";
import { getMeetingRooms } from "./administrator/meeting-room";

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

    console.log(where);

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