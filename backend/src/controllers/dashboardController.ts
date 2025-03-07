// src/controllers/dashboardController.ts

import {getBlogService, getBlogsService, getDashboardService} from "../service/dashboardService";

export const dashboardController = async (req: any, res: any) => {
  try{
    const dashboardStats = await getDashboardService();
    res.status(200).json(dashboardStats);
  }catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogsController = async (req: any, res: any) => {
    try {
        return await getBlogsService(req, res);
    } catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
};

export const getBlogController = async (req: any, res: any) => {
    try {
        return await getBlogService(req, res);
    }catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
};