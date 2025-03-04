import {createBlogService, getBlogsService} from "../../service/administrator/blogService";


export const getBlog = async (req: any, res: any) => {
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