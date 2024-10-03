import { prismaService } from "../utils/prismaService.js";

export const listAllChats = async (
  query = {
    gameId: "",
    teamId: "",
    userId: "",
    type: "",
    search: "",
    order: 1,
  },
) => {
  return await prismaService.chat.findMany({
    where: {
      gameId: query.gameId,
      teamId: query.teamId,
      userId: query.userId,
      messageType: {
        contains: query.type,
      },
      message: {
        contains: query.search,
      },
    },
    orderBy: {
      createdAt: query.order === 1 ? "desc" : "asc",
    },
  });
};
