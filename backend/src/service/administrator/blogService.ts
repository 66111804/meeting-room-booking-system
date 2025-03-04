// src/service/administrator/blogService.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getBlogsService = async (req: any, res: any) => {
  let { page, limit, search } = req.query;

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

export const getBlogService = async (req: any, res: any) => {
    const { id } = req.params;
    const blog = await prisma.post.findUnique({
        where: {
        id: parseInt(id),
        },
    });
    return res.status(200).json(blog);
}

export const createBlogService = async (req: any, res: any) => {
    const { title, content, contentHtml, published, tag } = req.body;
    const file = req.file;
    const imageUrl = file ? file.filename : "";
    const blog = await prisma.post.create({
        data: {
            title,
            image: imageUrl,
            authorId: req.user.id,
            content: content,
            contentHtml: contentHtml,
        },
    });
    return res.status(201).json(blog);
}