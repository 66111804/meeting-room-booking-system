import {
    getHourlyBookingReportService,
    getTopBookingReportService,
    getTopDepartmentBookingReportService
} from "../../service/administrator/reportService";


export const getTopBooks = async (req: any, res: any) => {
    try {
       return await getTopBookingReportService(req, res);
    } catch (e: any) {
        return res.status(500).json({ message: e.message });
    }
}

export const getTopDepartmentBooks = async (req: any, res: any) => {
    try {
       return await getTopDepartmentBookingReportService(req, res);
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