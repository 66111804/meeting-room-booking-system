// src/service/dashboardService.ts


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardService = async () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

  const last30DaysBookings = await prisma.meetingRoomBooking.count({
    where: {
      startTime: {
        gte: thirtyDaysAgo,
      },
      status: "confirmed"
    }
  });

  const totalCompletedBookings = await prisma.meetingRoomBooking.count({
    where: {
      status: "confirmed",
      endTime: {
        lt: new Date()
      }
    }
  });

  const pendingBookings = await prisma.meetingRoomBooking.count({
    where: {
      status: "confirmed",
      startTime: {
        gt: new Date()
      }
    }
  });

  const previousPeriodBookings = await prisma.meetingRoomBooking.count({
    where: {
      startTime: {
        gte: new Date(thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)),
        lt: thirtyDaysAgo
      },
      status: "confirmed"
    }
  });

  const last30DaysPercentage = previousPeriodBookings > 0
    ? (((last30DaysBookings - previousPeriodBookings) / previousPeriodBookings) * 100).toFixed(2)
    : "0.00";


  return [
    {
      title: 'การใช้งานล่าสุด 30 วัน',
      value: last30DaysBookings,
      icon: 'briefcase',
      persantage: last30DaysPercentage,
      profit: Number(last30DaysPercentage) >= 0 ? 'up' : 'down',
      month: ''
    },
    {
      title: 'ยอดใช้งานแล้ว',
      value: totalCompletedBookings,
      icon: 'award',
      persantage: '3.58', // You would calculate this based on historical data
      profit: 'up',
      month: ''
    },
    {
      title: 'ยอดจองรอใช้งาน',
      value: pendingBookings,
      icon: 'clock',
      persantage: '10.35', // You would calculate this based on historical data
      profit: 'down',
      month: ''
    }
  ];

};

export const getBlogsService = async (req:any, res:any) => {
  let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    search = search || '';

    let where = {};

    if (search) {
      where = {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ]
      };
    }

    const blogs = await prisma.post.findMany({
      where:{
        ...where,
        published: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy:{
        updatedAt:"desc"
      },
        select:{
            id:true,
            title:true,
            image:true,
            content:true,
            published:true,
            tags:true,
            createdAt:true,
            updatedAt:true,
            author:{
                select:{
                    id:true,
                    name:true
                }
            }
        }
    });

    const total = await prisma.post.count({ where });
    const totalPages = Math.ceil(total / limit);
    const currentPage = page;
    return res.status(200).json({ blogs, total, totalPages, currentPage });
}

export const getBlogService = async (req:any, res:any) => {
    const { id } = req.params;
    if(!id){
        return res.status(400).json({message:"Id is required"});
    }
    const blog = await prisma.post.findUnique({
        where: {
        id: parseInt(id),
        },
        select: {
            author:
                {
                  select: {
                    id: true,
                    name: true
                  }
                }
          }
      });
    return res.status(200).json(blog);
}