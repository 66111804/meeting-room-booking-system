// src/controllers/slotTimeController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { addMinutes, parse, format, startOfDay, endOfDay, startOfWeek, addDays } from "date-fns";

const prisma = new PrismaClient();


interface GetTimeSlotsQuery {
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export const getTimeSlots = async (req: Request<{}, {}, {}, GetTimeSlotsQuery>, res: Response) => {
  try {
    const {
      isActive,
      startTime,
      endTime,
      page = 1,
      limit = 100
    } = req.query;

    //  where condition
    const where: any = {};

    // check isActive if provided
    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    // check startTime if provided
    if (startTime) {
      where.startTime = {
        gte: parse(startTime, "HH:mm", new Date())
      };
    }

    // check endTime if provided
    if (endTime) {
      where.endTime = {
        lte: parse(endTime, "HH:mm", new Date())
      };
    }

    // calculate skip value
    const skip = (page - 1) * limit;

    // pick slots from database
    const [slots, total] = await Promise.all([
      prisma.slotTime.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: "asc"
        }
      }),
      prisma.slotTime.count({ where })
    ]);

    // convert slots to a more readable format
    const formattedSlots = slots.map(slot => ({
      id: slot.id,
      startTime: format(slot.startTime, "HH:mm"),
      endTime: format(slot.endTime, "HH:mm"),
      isActive: slot.isActive,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt
    }));

    // send response
    res.status(200).json({
      data: formattedSlots,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({
      error: "Failed to fetch time slots",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


export const generateDefaultSlots = async (req: Request, res: Response) => {
  try {
    // clear existing slots
    // await prisma.slotTime.deleteMany({});

    // ALTER TABLE `booking-meeting-room`.`SlotTime`
    // AUTO_INCREMENT = 212 ;

    // set AUTO_INCREMENT to 1
    await prisma.$transaction([
      prisma.slotTime.deleteMany(),
      prisma.$executeRaw`ALTER TABLE \`SlotTime\` AUTO_INCREMENT = 1`
    ]);

    const startTime = parse("08:00", "HH:mm", new Date());
    const endTime = parse("18:00", "HH:mm", new Date());
    const interval = 30; // minutes
    const slots = [];

    let currentTime = startTime;

    while (currentTime < endTime) {
      const timeSlot = {
        startTime: currentTime,
        endTime: addMinutes(currentTime, interval),
        isActive: true
      };

      slots.push(timeSlot);
      currentTime = addMinutes(currentTime, interval);
    }

    // save database
    const createdSlots = await prisma.slotTime.createMany({
      data: slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive
      }))
    });

    res.status(201).json({
      message: "Time slots generated successfully",
      count: createdSlots.count,
      slots: slots.map(slot => ({
        startTime: format(slot.startTime, "HH:mm"),
        endTime: format(slot.endTime, "HH:mm")
      }))
    });

  } catch (error) {
    console.error("Error generating time slots:", error);
    res.status(500).json({
      error: "Failed to generate time slots",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const generateDefaultSlotsSafe = async (req: Request, res: Response) => {
  try {
    const startTime = parse("08:00", "HH:mm", new Date());
    const endTime = parse("18:00", "HH:mm", new Date());
    const interval = 30; // minutes
    const slots = [];

    let currentTime = startTime;

    // สร้าง array ของ time slots ที่ต้องการ
    while (currentTime < endTime) {
      const currentTimeString = format(currentTime, "HH:mm");
      const nextTimeString = format(addMinutes(currentTime, interval), "HH:mm");

      slots.push({
        startTime: currentTimeString,
        endTime: nextTimeString
      });

      currentTime = addMinutes(currentTime, interval);
    }

    // สร้าง array เก็บ slots ที่จะเพิ่มใหม่
    const slotsToAdd = [];

    // ตรวจสอบแต่ละ slot
    for (const slot of slots) {
      // ตรวจสอบว่ามี slot นี้อยู่แล้วหรือไม่
      const existingSlot = await prisma.slotTime.findFirst({
        where: {
          startTime: parse(slot.startTime, "HH:mm", new Date()),
          endTime: parse(slot.endTime, "HH:mm", new Date())
        }
      });

      // ถ้ายังไม่มี slot นี้ ให้เพิ่มเข้าไปใน array ที่จะสร้างใหม่
      if (!existingSlot) {
        slotsToAdd.push({
          startTime: parse(slot.startTime, "HH:mm", new Date()),
          endTime: parse(slot.endTime, "HH:mm", new Date()),
          isActive: true
        });
      }
    }

    // สร้าง slots ใหม่ทั้งหมดที่ยังไม่มีในระบบ
    const createdSlots = await prisma.slotTime.createMany({
      data: slotsToAdd,
      skipDuplicates: true // ข้ามการสร้างถ้ามีข้อมูลซ้ำ
    });

    // ดึงข้อมูล slots ทั้งหมดที่มีในระบบมาแสดง
    const allSlots = await prisma.slotTime.findMany({
      orderBy: {
        startTime: "asc"
      }
    });

    res.status(201).json({
      message: "Time slots generated successfully",
      newSlotsAdded: createdSlots.count,
      totalSlots: allSlots.length,
      slots: allSlots.map(slot => ({
        id: slot.id,
        startTime: format(slot.startTime, "HH:mm"),
        endTime: format(slot.endTime, "HH:mm"),
        isActive: slot.isActive
      }))
    });

  } catch (error) {
    console.error("Error generating time slots:", error);
    res.status(500).json({
      error: "Failed to generate time slots",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

interface CheckAvailabilityQuery {
  date?: string;           // (YYYY-MM-DD)
  meetingRoomId?: string; // (optional)
}

// Example: GET /api/slots/availability?date=2022-12-31&meetingRoomId=1
export const getAvailableTimeSlots = async (
  req: Request<{}, {}, {}, CheckAvailabilityQuery>,
  res: Response
): Promise<any>  => {
  try {
    // const { date, meetingRoomId } = req.query;
    const date = req.query.date as string;
    const meetingRoomId = req.query.meetingRoomId as string; // optional
    if (!date) {
      return res.status(400).json({
        error: "Date is required in format YYYY-MM-DD"
      });
    }

    // convert Date object
    const checkDate = new Date(date);
    const dayStart = startOfDay(checkDate);
    const dayEnd = endOfDay(checkDate);

    // find all bookings for the day
    const timeSlots = await prisma.slotTime.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        startTime: "asc"
      }
    });

    // find all bookings for the day
    const bookings = await prisma.meetingRoomBooking.findMany({
      where: {
        startTime: {
          gte: dayStart
        },
        endTime: {
          lte: dayEnd
        },
        ...(meetingRoomId ? { meetingRoomId: parseInt(meetingRoomId) } : {}),
        status: "confirmed"
      },
      include: {
        MeetingRoom: {
          select: {
            name: true
          }
        },
        User: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    // format time slots
    const formattedSlots = timeSlots.map(slot => {
      const slotStartTime = format(slot.startTime, "HH:mm");
      const slotEndTime = format(slot.endTime, "HH:mm");

      // find overlapping bookings
      const overlappingBookings = bookings.filter(booking => {
        const bookingStartTime = format(booking.startTime, "HH:mm");
        const bookingEndTime = format(booking.endTime, "HH:mm");

        return (
          (bookingStartTime <= slotStartTime && bookingEndTime > slotStartTime) ||
          (bookingStartTime >= slotStartTime && bookingStartTime < slotEndTime)
        );
      });
      // return formatted slot
      return {
        id: slot.id,
        startTime: slotStartTime,
        endTime: slotEndTime,
        isAvailable: overlappingBookings.length === 0,
        bookings: overlappingBookings.map(booking => ({
          id: booking.id,
          title: booking.title,
          roomName: booking.MeetingRoom.name,
          bookedBy: `${booking.User.name} ${booking.User.lastName}`,
          startTime: format(booking.startTime, "HH:mm"),
          endTime: format(booking.endTime, "HH:mm")
        }))
      };
    });

    // send response
      res.status(200).json({
      date: format(checkDate, "yyyy-MM-dd"),
      timeSlots: formattedSlots,
      totalSlots: formattedSlots.length,
      availableSlots: formattedSlots.filter(slot => slot.isAvailable).length,
      bookedSlots: formattedSlots.filter(slot => !slot.isAvailable).length
    });

  } catch (error) {
    console.error("Error checking time slots availability:", error);
     res.status(500).json({
      error: "Failed to check time slots availability",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


export const getAvailableTimeSlotsV2 = async (
  req: Request<{}, {}, {}, CheckAvailabilityQuery>,
  res: Response
): Promise<any>  => {
  try {
    const { date } = req.query;
    const checkDate = new Date(date as string);
    const dayStart = startOfDay(checkDate);
    const _startOfWeek = startOfWeek(checkDate, { weekStartsOn: 0 });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const currentDate = addDays(_startOfWeek, i);
      return format(currentDate, "yyyy-MM-dd");
    });

    console.log(weekDays);

    // find all bookings for the day and week
    const timeSlots = await prisma.slotTime.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        startTime: "asc"
      }
    });

    const days = await Promise.all(weekDays.map(async (day) => {
      const dayStart = startOfDay(new Date(day));
      const dayEnd = endOfDay(new Date(day));

      const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
          startTime: {
            gte: dayStart
          },
          endTime: {
            lte: dayEnd
          },
          status: "confirmed"
        },
        include: {
          MeetingRoom: {
            select: {
              name: true
            }
          },
          User: {
            select: {
              name: true,
              lastName: true
            }
          }
        }
      });

      // format time slots
      const formattedSlots = timeSlots.map(slot => {
        const slotStartTime = format(slot.startTime, "HH:mm");
        const slotEndTime = format(slot.endTime, "HH:mm");

        // find overlapping bookings
        const overlappingBookings = bookings.filter(booking => {
          const bookingStartTime = format(booking.startTime, "HH:mm");
          const bookingEndTime = format(booking.endTime, "HH:mm");

          return (
            (bookingStartTime <= slotStartTime && bookingEndTime > slotStartTime) ||
            (bookingStartTime >= slotStartTime && bookingStartTime < slotEndTime)
          );
        });
        // return formatted slot
        return {
          id: slot.id,
          startTime: slotStartTime,
          endTime: slotEndTime,
          isAvailable: overlappingBookings.length === 0,
          bookings: overlappingBookings.map(booking => ({
            id: booking.id,
            title: booking.title,
            roomName: booking.MeetingRoom.name,
            bookedBy: `${booking.User.name} ${booking.User.lastName}`,
            startTime: format(booking.startTime, "HH:mm"),
            endTime: format(booking.endTime, "HH:mm")
          }))
        };
      });

      return {
        date: day,
        timeSlots: formattedSlots
      };
    }));
    // send response
    const headerTimeSlots = timeSlots.map(slot => ({
      id: slot.id,
      startTime: format(slot.startTime, 'HH:mm'),
      endTime: format(slot.endTime, 'HH:mm'),
      isAvailable: true,
      bookings: []
    }));


    res.status(200).json({
      days: days,
      timeSlots: headerTimeSlots
    });
  }catch (error) {
    console.error("Error checking time slots availability:", error);
     res.status(500).json({
      error: "Failed to check time slots availability",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
