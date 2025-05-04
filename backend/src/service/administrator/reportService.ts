// noinspection DuplicatedCode

import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
import dayjs from "../../shared/dayjs";
import {addDays, eachDayOfInterval, format, parse, parseISO} from "date-fns";

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
            status: 'confirmed',
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
        const label = format(new Date(booking.startTime), 'dd-MMM-yy'); // ex: 12-Mar
        grouped[label] = (grouped[label] || 0) + 1;
    });

    const fullDates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
    });
    const result = fullDates.map((date) => {
        const label = format(date, 'dd-MMM-yy');
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

export const getTopBookingReportByRoomNamesService = async (req: any, res: any) => {
    const { startDate, endDate, sort = 'desc' } = req.query;
    let roomNames: any = req.query.roomNames;

    if (!startDate || !endDate || !roomNames || roomNames.length === 0) {
        return res.status(400).json({ message: 'required startDate, endDate and roomNames[]' });
    }
    if(roomNames.includes(',')) {
        // convert string to array
        roomNames = roomNames.split(',');
    }else
    {
        // convert string to array
        roomNames = [roomNames];
    }
    const arrNames:string[] = roomNames;

    const rooms = await prisma.meetingRoom.findMany({
        where: {
            name: {
                in: roomNames
            }
        },
        select: {
            id: true,
            name: true
        }
    });

    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));
    const roomIds = rooms.map(r => r.id);

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            meetingRoomId: { in: roomIds },
            status: 'confirmed',
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        select: {
            meetingRoomId: true,
            startTime: true
        }
    });

    const fullDates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
    });

    const dateLabels = fullDates.map(d => format(d, 'dd-MMM-yy')); // ex: 12-Mar-23

    // สร้างโครง data: { [roomName]: { [label]: count } }
    const groupedData: Record<string, Record<string, number>> = {};
    for (const roomName of roomNames) {
        groupedData[roomName] = {};
        for (const label of dateLabels) {
            groupedData[roomName][label] = 0;
        }
    }

    for (const b of bookings) {
        const label = format(new Date(b.startTime), 'dd-MMM-yy');
        const roomName = roomMap[b.meetingRoomId];
        if (roomName) {
            groupedData[roomName][label]++;
        }
    }

    // แปลงเป็น datasets [{ label: id,roomName, data: [count] }]
    const datasets = arrNames.map(room => ({
        label: room,
        data: dateLabels.map(label => groupedData[room][label] || 0)
    }));

    return res.json({
        labels: dateLabels,
        datasets
    });
};

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
            status: 'confirmed',
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
            status: 'confirmed',
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

    /* Example response
    {
        data: [
            { department: 'IT', totalBookings: 10 },
            { department: 'HR', totalBookings: 5 },
            ...
        ],
        total: 2,
        totalPages: 1,
        current: 1
       }
     */
}

export const getTopDepartmentBookingReportByRoomsNameService = async (req: any, res: any) => {
    const { startDate, endDate , sort = 'desc' } = req.query;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let roomNames: any = req.query.roomNames;

    if (!startDate || !endDate || !roomNames || roomNames.length === 0) {
        return res.status(400).json({ message: 'required startDate, endDate and roomNames[]' });
    }
    if(roomNames.includes(',')) {
        // convert string to array
        roomNames = roomNames.split(',');
    }else
    {
        // convert string to array
        roomNames = [roomNames];
    }
    const arrNames:string[] = roomNames;

    const rooms = await prisma.meetingRoom.findMany({
        where: {
            name: {
                in: roomNames
            }
        },
        select: {
            id: true,
            name: true
        }
    });
    const roomIds = rooms.map(room => room.id);

    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

    const grouped = await prisma.meetingRoomBooking.groupBy({
        by: ['userId'],
        where: {
            status: 'confirmed',
            meetingRoomId: { in: roomIds },
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
    const resultWithRoomNames = paginatedResult.map((item) => {
        const roomNames = Object.keys(roomMap).filter((roomId) => {
            return item.department === roomMap[roomId];
        });
        return {
            ...item,
            roomNames: roomNames.join(', ')
        };
    });

    return res.json({
        data: resultWithRoomNames,
        total,
        totalPages,
        current: page
    });

    /* Example response
    {
        data: [
            { department: 'IT', totalBookings: 10, roomNames: 'Room A, Room B' },
            { department: 'HR', totalBookings: 5, roomNames: 'Room C' },
            ...
        ],
        total: 2,
        totalPages: 1,
        current: 1
       }
     */
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
    // noinspection DuplicatedCode
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

    result.sort((a, b) => {
        const [aHour, aMinute] = a.hour.split(':').map(Number);
        const [bHour, bMinute] = b.hour.split(':').map(Number);
        return aHour - bHour || aMinute - bMinute;
    });

    const datasets = [{
        label: 'All Rooms',
        data: result.map(item => item.totalBookings)
    }];

    return res.json({
        labels: result.map(item => item.hour),
        datasets
    });

    /* Example response
    {
        labels: ['08:00', '08:30', ...],
        datasets: [
            { label: 'All Rooms', data: [2, 3, ...] }
        ]
       }
     */
}

export const getHourlyBookingReportByRoomNamesService = async (req: any, res: any) => {
    const { startDate, endDate } = req.query;
    let roomNames: any = req.query.roomNames;

    if (!startDate || !endDate || !roomNames || roomNames.length === 0) {
        return res.status(400).json({ message: 'required startDate, endDate and roomNames[]' });
    }

    if (roomNames.includes(',')) {
        roomNames = roomNames.split(',');
    } else {
        roomNames = [roomNames];
    }

    const rooms = await prisma.meetingRoom.findMany({
        where: { name: { in: roomNames } },
        select: { id: true, name: true }
    });

    const roomIdNameMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            meetingRoomId: { in: rooms.map(r => r.id) },
            status: 'confirmed',
            startTime: { gte: new Date(startDate), lte: new Date(endDate) }
        },
        select: {
            meetingRoomId: true,
            startTime: true,
            endTime: true
        }
    });

    // เตรียม labels: '08:00' ถึง '17:30'
    const timeSlots: string[] = [];
    for (let hour = 8; hour <= 17; hour++) {
        for (let min of [0, 30]) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`);
        }
    }

    // เตรียม intervalData แยกตามห้อง
    const roomDataMap: Record<string, Record<string, number>> = {};
    for (const room of rooms) {
        roomDataMap[room.name] = {};
        for (const slot of timeSlots) {
            roomDataMap[room.name][slot] = 0;
        }
    }

    const totalDataMap: Record<string, number> = {};
    for (const slot of timeSlots) {
        totalDataMap[slot] = 0;
    }

    // นับการจองแบบแยกห้อง
    for (const b of bookings) {
        const roomName = roomIdNameMap[b.meetingRoomId];
        let current = dayjs(b.startTime).tz('Asia/Bangkok').startOf('minute');
        const end = dayjs(b.endTime).tz('Asia/Bangkok').startOf('minute');

        while (current.isBefore(end)) {
            const hour = current.hour();
            const minute = current.minute();
            if ((hour > 7 && hour < 17) || (hour === 17 && minute <= 30)) {
                const label = `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
                if (roomDataMap[roomName][label] !== undefined) {
                    roomDataMap[roomName][label]++;
                    totalDataMap[label]++;
                }
            }
            current = current.add(30, 'minute');
        }
    }

    const datasets = Object.entries(roomDataMap).map(([roomName, slotMap]) => ({
        label: roomName,
        data: timeSlots.map(t => slotMap[t])
    }));
    const totalDataset = {
        label: 'All Rooms',
        data: timeSlots.map(t => totalDataMap[t])
    };

    return res.json({
        labels: timeSlots,
        datasets: [totalDataset, ...datasets]
    });
};


export const getInfoByRoomIdAndDateBooking = async (req: any, res: any) => {
    // roomId, date(dd-MM-yyyy)
    const { roomId, date } = req.query;
    if (!roomId || !date) {
        return res.status(400).json({ message: 'required roomId and date' });
    }

    const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
    const nextDay = addDays(parsedDate, 1);

    const bookings = await prisma.meetingRoomBooking.findMany({
        where: {
            meetingRoomId: Number(roomId),
            startTime: {
                gte: parsedDate,
                lt: nextDay
            }
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            userId: true,
            meetingRoomId: true,
            User: {
                select: {
                    name: true,
                    department: true
                }
            }
        }
    });

    return res.json({ bookings });

}

export const getHourlyBookingReportByRoomNameService = async (req: any, res: any) => {
    const { startDate, endDate, roomName } = req.query;
    // noinspection DuplicatedCode
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

    // sort by hour
    result.sort((a, b) => {
        const [aHour, aMinute] = a.hour.split(':').map(Number);
        const [bHour, bMinute] = b.hour.split(':').map(Number);
        return aHour - bHour || aMinute - bMinute;
    });

    const datasets = [{
        label: roomName,
        data: result.map(item => item.totalBookings)
    }];

    return res.json({
        labels: result.map(item => item.hour),
        datasets
    });


    /* Example response
    {
        labels: ['08:00', '08:30', ...],
        datasets: [
            { label: 'Room A', data: [2, 3, ...] },
            { label: 'Room B', data: [1, 4, ...] },
            ...
        ]
       }
     */
}
