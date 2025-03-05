// src/service/administrator/blogService.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "node:path";
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
            published: published === 1,
            tags: tag,
            content: content,
            contentHtml: contentHtml,
        },
    });
    return res.status(201).json(blog);
}

export const updateBlogService = async (req: any, res: any) => {
    const { id } = req.params;
    let { title, content, contentHtml, published, tag } = req.body;
    const file = req.file;
    published = typeof published === "string" ? parseInt(published) : published;
    const imageUrl = file ? file.filename : "";
    if(!id) return res.status(400).json({ message: "Blog id is required" });
    const blog = await prisma.post.update({
        where: {
            id: parseInt(id),
        },
        data: {
            title,
            image: imageUrl,
            published: published === 1,
            tags: tag,
            content: content,
            contentHtml: contentHtml,
        },
    });
    return res.status(200).json(blog);
};

export const deleteBlogService = async (req: any, res: any) => {
    const { id } = req.params;
    if(!id) return res.status(400).json({ message: "Blog id is required" });
    const post = await prisma.post.delete({
        where: {
            id: parseInt(id),
        },
    });
    if(!post) {
        return res.status(404).json({ message: "Blog not found" });
    }

    if(post.image !== "") {
        // Delete image
        try {
            fs.unlinkSync(path.join(__dirname, "../../../uploads/" + post.image));
        }catch(err) {
            console.error(err);
        }
    }
    return res.status(200).json({ message: "Blog deleted successfully" });
};