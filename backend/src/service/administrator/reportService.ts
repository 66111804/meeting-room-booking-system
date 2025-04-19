import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
import dayjs from "../../shared/dayjs";
import {eachDayOfInterval, format, parseISO} from "date-fns";



export const getTopBookingReportService = async (req: any, res: any) => {
    const { startDate, endDate, sort = 'desc'} = req.query;
    let { page = 1, limit = 1000 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'required startDate and endDate' });
    }

    // Group bookings by meetingRoomId and count
    const grouped = await prisma.meetingRoomBooking.groupBy({
        by: ['meetingRoomId'],
        where: {
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        },
        _count: {
            meetingRoomId: true,
        },
        orderBy: {
            _count: {
                meetingRoomId: sort === 'asc' ? 'asc' : 'desc',
            },
        },
    });

    const total = grouped.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedGrouped = grouped.slice((page - 1) * limit, page * limit);

    const roomIds = paginatedGrouped.map((g) => g.meetingRoomId);

    const rooms = await prisma.meetingRoom.findMany({
        where: { id: { in: roomIds } },
        select: {
            id: true,
            name: true,
            description: true,
            capacity: true,
            imageUrl: true,
        },
    });

    const booking = paginatedGrouped.map((g) => {
        const room = rooms.find((r) => r.id === g.meetingRoomId);
        return {
            roomId: g.meetingRoomId,
            name: room?.name || 'Unknown',
            description: room?.description || '',
            capacity: room?.capacity || 0,
            imageUrl: room?.imageUrl || '',
            totalBookings: g._count.meetingRoomId,
        };
    });

    return res.json({
        booking,
        total,
        totalPages,
        current: page,
    });
}
export const getTopBookingReportByRoomNameService = async (req: any, res: any) => {
    const { startDate, endDate, sort = 'desc', roomName} = req.query;
    let { page = 1, limit = 1000000 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!startDate || !endDate || !roomName) {
        return res.status(400).json({ message: 'required startDate, endDate and roomName' });
    }

    const room = await prisma.meetingRoom.findFirst({
        where: {
            name: {
                contains: roomName,
            }
        },
        select: { id: true }
    });

    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            meetingRoomId: room.id,
            status: 'confirmed',
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        select: {
            startTime: true
        }
    });
    const grouped: Record<string, number> = {};
    bookings.forEach((booking) => {
        const label = format(new Date(booking.startTime), 'dd-MMM'); // ex: 12-Mar
        grouped[label] = (grouped[label] || 0) + 1;
    });

    const fullDates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
    });
    const result = fullDates.map((date) => {
        const label = format(date, 'dd-MMM');
        return {
            name:label,
            totalBookings: grouped[label] || 0
        };
    });

    if (sort === 'desc') {
        result.reverse();
    }

    const total = result.length;
    const totalPages = 1;
    const paginated = 1;

    return res.json({
        booking: result,
        total,
        totalPages,
        current: page
    });
}

export const getTopDepartmentBookingReportService = async (req: any, res: any) => {
    const { startDate, endDate, sort = 'desc'} = req.query;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'required startDate and endDate' });
    }
    // Group bookings by userId and count
    const grouped = await prisma.meetingRoomBooking.groupBy({
        by: ['userId'],
        where: {
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        _count: {
            _all: true
        }
    });

    const userBookingCountMap: Record<number, number> = {};

    for (const booking of grouped) {
        userBookingCountMap[booking.userId] = (userBookingCountMap[booking.userId] || 0) + booking._count._all;
    }

    const userIds = Object.keys(userBookingCountMap).map(id => parseInt(id));
    const users = await prisma.user.findMany({
        where: {
            id: { in: userIds }
        },
        select: {
            id: true,
            name: true,
            department: true
        }
    });

    const departmentMap: Record<string, number> = {};

    for (const user of users) {
        const department = user.department || 'Unknown';
        departmentMap[department] = (departmentMap[department] || 0) + userBookingCountMap[user.id];
    }

    // convert to array
    let result =  Object.entries(departmentMap).map(([department, totalBookings]) => ({
        department,
        totalBookings
    }));

    // sort by totalBookings
    result = result.sort((a, b) => {
        return sort === 'asc' ? a.totalBookings - b.totalBookings : b.totalBookings - a.totalBookings;
    });

    // pagination
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResult = result.slice((page - 1) * limit, page * limit);

    return res.json({
        data: paginatedResult,
        total,
        totalPages,
        current: page
    });

}

export const getTopDepartmentBookingReportByRoomNameService = async (req: any, res: any) => {
    const { startDate, endDate, roomName, sort = 'desc' } = req.query;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!startDate || !endDate || !roomName) {
        return res.status(400).json({ message: 'required startDate, endDate and roomName' });
    }

    const rooms = await prisma.meetingRoom.findMany({
        where: {
            name: {
                contains: roomName,
            }
        },
        select: {
            id: true
        }
    });

    const roomIds = rooms.map(room => room.id);
    if (roomIds.length === 0) {
        return res.status(404).json({ message: 'No meeting rooms matched roomName' });
    }

    const grouped = await prisma.meetingRoomBooking.groupBy({
        by: ['userId'],
        where: {
            meetingRoomId: {
                in: roomIds
            },
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        _count: {
            _all: true
        }
    });
    // noinspection DuplicatedCode
    const userBookingCountMap: Record<number, number> = {};
    for (const booking of grouped) {
        userBookingCountMap[booking.userId] = (userBookingCountMap[booking.userId] || 0) + booking._count._all;
    }

    const userIds = Object.keys(userBookingCountMap).map(id => parseInt(id));
    const users = await prisma.user.findMany({
        where: {
            id: { in: userIds }
        },
        select: {
            id: true,
            name: true,
            department: true
        }
    });

    const departmentMap: Record<string, number> = {};
    for (const user of users) {
        const department = user.department || 'Unknown';
        departmentMap[department] = (departmentMap[department] || 0) + userBookingCountMap[user.id];
    }

    // convert to array
    let result = Object.entries(departmentMap).map(([department, totalBookings]) => ({
        department,
        totalBookings
    }));

    // sort
    result = result.sort((a, b) => {
        return sort === 'asc'
            ? a.totalBookings - b.totalBookings
            : b.totalBookings - a.totalBookings;
    });

    // pagination
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResult = result.slice((page - 1) * limit, page * limit);

    return res.json({
        data: paginatedResult,
        total,
        totalPages,
        current: page
    });
}

// hourly booking report
export const getHourlyBookingReportService = async (req: any, res: any) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'required startDate and endDate' });
    }

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            },
            status: 'confirmed'
        },
        select: {
            startTime: true,
            endTime: true
        }
    });

    const intervalData: Record<string, number> = {};
    for (let hour = 8; hour < 18; hour++) {
        for (let min of [0, 30]) {
            const label = `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
            intervalData[label] = 0;
        }
    }
    bookings.forEach((b) => {
        let  start = dayjs(b.startTime).tz('Asia/Bangkok').startOf('minute');
        const end = dayjs(b.endTime).tz('Asia/Bangkok').startOf('minute');
        while (start.isBefore(end)) {
            const hour = start.hour();
            const minute = start.minute();
            // เฉพาะช่วง 08:00 - 17:30 เท่านั้น
            if (
                (hour > 7 && hour < 17) || (hour === 17 && minute <= 30)
            ) {
                const label = `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
                if (intervalData[label] !== undefined) {
                    intervalData[label]++;
                }
            }
            start = start.add(30, 'minute');
        }
    });

    const result = Object.entries(intervalData).map(([hour, totalBookings]) => ({
        hour,
        totalBookings
    }));
    // sort by hour
    return res.json({ data: result ,total: 0, totalPages: 0, current: 0 });
}

export const getHourlyBookingReportByRoomNameService = async (req: any, res: any) => {
    const { startDate, endDate, roomName } = req.query;
    if (!startDate || !endDate || !roomName) {
        return res.status(400).json({ message: 'required startDate, endDate and roomName' });
    }

    const room = await prisma.meetingRoom.findFirst({
        where: {
            name: {
                contains: roomName,
            }
        },
        select: { id: true }
    });

    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            meetingRoomId: room.id,
            status: 'confirmed',
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        select: {
            startTime: true,
            endTime: true
        }
    });

    // console.log('bookings', bookings);

    // noinspection DuplicatedCode
    const intervalData: Record<string, number> = {};
    for (let hour = 8; hour < 18; hour++) {
        for (let min of [0, 30]) {
            const label = `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
            intervalData[label] = 0;
        }
    }

    bookings.forEach((b) => {
        let start = dayjs(b.startTime).tz('Asia/Bangkok').startOf('minute');
        const end = dayjs(b.endTime).tz('Asia/Bangkok').startOf('minute');
        while (start.isBefore(end)) {
            const hour = start.hour();
            const minute = start.minute();
            // เฉพาะช่วง 08:00 - 17:30 เท่านั้น
            if (
                (hour > 7 && hour < 17) || (hour === 17 && minute <= 30)
            ) {
                const label = `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
                if (intervalData[label] !== undefined) {
                    intervalData[label]++;
                }
            }
            start = start.add(30, 'minute');
        }
    });

    const result = Object.entries(intervalData).map(([hour, totalBookings]) => ({
        hour,
        totalBookings
    }));

    return res.json({
        data: result,
        total: result.length,
        totalPages: 1,
        current: 1
    });
}