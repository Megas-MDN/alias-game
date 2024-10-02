import { PrismaClient } from "@prisma/client";

export const prismaService = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_DOCKER_MONGO
}); 