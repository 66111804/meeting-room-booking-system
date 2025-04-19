import {
    getHourlyBookingReportService,
    getTopBookingReportService,
    getTopDepartmentBookingReportService,
    getTopBookingReportByRoomNameService, getTopDepartmentBookingReportByRoomNameService
} from "../../service/administrator/reportService";


export const getTopBooks = async (req: any, res: any) => {
    try {
        const {roomName = ''} = req.query;

        if(roomName === '') {
            return await getTopBookingReportService(req, res);
        }else {
            return await getTopBookingReportByRoomNameService(req, res);
        }
    } catch (e: any) {
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
        return await getHourlyBookingReportService(req, res);
    } catch (e: any) {
        return res.status(500).json({ message: e.message });
    }
}