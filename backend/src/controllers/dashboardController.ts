// src/controllers/dashboardController.ts

import { getDashboardService } from "../service/dashboardService";

export const dashboardController = async (req: any, res: any) => {
  try{
    const dashboardStats = await getDashboardService();
    res.status(200).json(dashboardStats);
  }catch (error:any) {
    res.status(500).json({ error: error.message });
  }
};