import {PrismaClient} from '@prisma/client';
import dotenv from "dotenv";
import {type DefaultEventsMap, Socket} from "socket.io";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
dotenv.config({path: __dirname + '/.env'});
const SECRET = process.env.SECRET || 'secret';
export const popScore = async (req: any, res: any) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const userId = user.id;
        const userFind = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!userFind) {
            return res.status(404).json({message: 'User not found'});
        }

        return res.json({score: userFind.score});
    } catch (e: any) {
        return res.status(500).json({error: e.message});
    }
}

export const addScore = async (userId: number, score: number) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        if (user !== null) {
            const userScore = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    score: {
                        increment: 1
                    }
                }
            });
            return userScore.score;
        }
        return 0;
    } catch (e: any) {
        console.error(e.message);
        return 0;
    }
}

// กำหนด type หรือ interface ที่มีฟิลด์ rank
interface UserWithRank {
    username: string;
    score: number;
    status: string | null;
    updatedAt: Date;
    rank: number; // เพิ่มฟิลด์ rank
}
let lastBroadcastTime = 0;
let cachedTopScore: UserWithRank[] = [];
export const broadcastScore = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socketId: string = "") => {
    try {

        const currentTime = Date.now();

        // ตรวจสอบว่ามีการเรียกใช้ฟังก์ชั่นภายใน 1 วินาทีหรือไม่
        if (currentTime - lastBroadcastTime < 1000 && cachedTopScore.length > 0) {
            console.log('Returning cached result');
            socket.broadcast.emit('topScore', cachedTopScore);
            socket.emit('topScore', cachedTopScore);
            return cachedTopScore;
        }


        // Get top score 10 users
        let topScore: UserWithRank[] = await prisma.user.findMany({
            take: 10,
            orderBy: {
                score: 'desc'
            },
            select: {
                username: true,
                score: true,
                status: true,
                updatedAt: true
            }
        }) as UserWithRank[]; // แคสต์ type เป็น UserWithRank

        // เพิ่ม rank ให้กับแต่ละ user ใน topScore
        topScore = topScore
            .sort((a, b) => b.score - a.score) // เรียงตามคะแนนจากมากไปน้อย
            .map((user, index) => ({
                ...user,
                rank: index + 1 // เพิ่มฟิลด์ rank
            }));

        if (socketId != "") {
            const userInSocket = await prisma.sessionSocket.findFirst({
                include: {
                    user: true
                },
                where: {
                    socketId: socketId
                }
            });

            if (userInSocket) {
                const user = userInSocket.user;
                if (user) {
                    // ตรวจสอบว่า user ที่เชื่อมต่อผ่าน socketId อยู่ใน topScore หรือไม่
                    const isUserInTopScore = topScore.find(u => u.username === user.username);

                    if (!isUserInTopScore) {

                        const userRankDb = await prisma.user.findFirst({
                            where: {
                                username: user.username
                            },
                            select: {
                                score: true
                            }
                        });

                        if (userRankDb) {
                            const userRank = await prisma.user.count({
                                where: {
                                    score: {
                                        gte: userRankDb.score
                                    }
                                }
                            });

                            // เพิ่มผู้ใช้ที่ไม่ได้อยู่ใน topScore พร้อมลำดับ
                            topScore.push({
                                username: user.username,
                                score: user.score,
                                status: user.status,
                                updatedAt: user.updatedAt,
                                rank: userRank
                            });
                        }
                    }
                }
            }
        }
        cachedTopScore = topScore;
        // ส่งข้อมูล topScore ไปยัง frontend
        socket.broadcast.emit('topScore', topScore);
        socket.emit('topScore', topScore);
        return topScore;
    } catch (e: any) {
        console.error(e.message);
        return [];
    }
};
export const popTopScore = async (req: any, res: any) => {
    try {
        const token = req.headers.authorization || '';
        let topScore: UserWithRank[] = await prisma.user.findMany({
            take: 10,
            orderBy: {
                score: 'desc'
            },
            select: {
                username: true,
                score: true,
                status: true,
                updatedAt: true
            }

        }) as UserWithRank[]; //

        topScore = topScore
            .sort((a, b) => b.score - a.score) // เรียงตามคะแนนจากมากไปน้อย
            .map((user, index) => ({
                ...user,
                rank: index + 1 // เพิ่มฟิลด์ rank
            }));

        if (token !== '') {
            const bearer = token.split(' ')[1];
            try {
                const user = jwt.verify(bearer, SECRET);
                if (user !== null && typeof user === 'object') {
                    const userInfo = await prisma.user.findFirst({
                        where: {
                            id: user.id
                        }
                    });

                    if (userInfo) {
                        const isUserInTopScore = topScore.find(u => u.username === userInfo.username);
                        if (!isUserInTopScore) {
                            const userRank = await prisma.user.count({
                                where: {
                                    score: {
                                        gte: userInfo.score
                                    }
                                }
                            });

                            topScore.push({
                                username: userInfo.username,
                                score: userInfo.score,
                                status: userInfo.status,
                                updatedAt: userInfo.updatedAt,
                                rank: userRank
                            });

                        }
                    }
                }
            } catch (e: any) {
                console.error(e.message);
            }
        }

        return res.json(topScore);
    } catch (e: any) {
        return res.status(500).json({error: e.message});
    }
};

