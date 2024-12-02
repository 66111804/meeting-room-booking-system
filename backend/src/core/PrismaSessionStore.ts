import { PrismaClient } from "@prisma/client";
import { Store } from "express-session";


class PrismaSessionStore extends Store {
  private prisma: PrismaClient;

  constructor(private prismaClient: PrismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async get(sid: string, callback: (err: any, session?: any | null) => void): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sid },
      });

      if (!session || session.expires < new Date()) {
        return callback(null, null);
      }

      callback(null, JSON.parse(session.sessionData));
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, sessionData: any, callback: (err?: any) => void): Promise<void> {
    try {
      const expires = sessionData.cookie?.expires || new Date(Date.now() + 86400000); // 1 day
      await this.prisma.session.upsert({
        where: { id: sid },
        update: {
          sessionData: JSON.stringify(sessionData),
          expires,
        },
        create: {
          id: sid,
          sessionData: JSON.stringify(sessionData),
          expires,
        },
      });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid: string, callback: (err?: any) => void): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { id: sid } });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

export default PrismaSessionStore;