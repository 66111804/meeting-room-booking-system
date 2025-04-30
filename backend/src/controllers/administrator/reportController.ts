import {
    getHourlyBookingReportService,
    getTopBookingReportService,
    getTopDepartmentBookingReportService,
    getTopBookingReportByRoomNameService,
    getTopDepartmentBookingReportByRoomNameService,
    getHourlyBookingReportByRoomNameService, getTopBookingReportByRoomNamesService
} from "../../service/administrator/reportService";


export const getTopBooks = async (req: any, res: any) => {
    try {
        // asd,456,...
        let roomNames = req.query.roomNames;

        // convert string to array
        if (typeof roomNames === 'string') {
            roomNames = roomNames.split(',');
        }

        if (!roomNames || (Array.isArray(roomNames) && roomNames.length === 0)) {
            return await getTopBookingReportService(req, res);
        }
        if (typeof roomNames === 'string') {
            req.query.roomNames = [roomNames];
        }

        // console.log(typeof req.query);

        return await getTopBookingReportByRoomNamesService(req, res);
    } catch (e: any) {
        console.error("Error fetching top books:", e);
        return res.status(500).json({ message: e.message });
    }
}

export const getTopDepartmentBooks = async (req: any, res: any) => {
    try {
        const {roomName = ''} = req.query;
        if(roomName === '') {
            return await getTopDepartmentBookingReportService(req, res);
        }else{
            return await getTopDepartmentBookingReportByRoomNameService(req, res);
        }
    } catch (e: any) {
        return res.status(500).json({ message: e.message });
    }
}

export const getHourlyBookingReport = async (req: any, res: any) => {
    try {
        const {roomName = ''} = req.query;
        if(roomName === '') {
            return await getHourlyBookingReportService(req, res);
        }
        else{
            return await getHourlyBookingReportByRoomNameService(req, res);
        }
    } catch (e: any) {
        return res.status(500).json({ message: e.message });
    }
}