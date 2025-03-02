// src/service/administrator/blogService.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getBlogsService = async (req: any, res: any) => {
  let { page, limit, search } = req.query;
  // console.log(req.query);
  // console.log({page, limit, search});

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let where = {};
  if (search) {
    where = {
      OR: [
        { title: { startsWith: search } },
        { content: { startsWith: search } },
      ]
    };
  }

  const blogs = await prisma.post.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy:{
      updatedAt:"desc"
    }
  });

  const total = await prisma.post.count({ where });
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({ blogs, total, totalPages });
};
