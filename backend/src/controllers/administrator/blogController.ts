import {
    createBlogService, deleteBlogService,
    getBlogService,
    getBlogsService,
    updateBlogService
} from "../../service/administrator/blogService";


export const getBlogs = async (req: any, res: any) => {
    try {
        return await getBlogsService(req, res);
    } catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
};

export const createBlog = async (req: any, res: any) => {
    try {
        return await createBlogService(req, res);
    } catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
};

export const getBlog = async (req: any, res: any) => {
    try {
        return await getBlogService(req, res);
    } catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
};

export const updateBlog = async (req: any, res: any) => {
    try{
        return await updateBlogService(req, res);
    }catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
}

export const deleteBlog = async (req: any, res: any) => {
    try {
         return await deleteBlogService(req, res);
    } catch (e:any) {
        return res.status(500).json({ message: e.message });
    }
}