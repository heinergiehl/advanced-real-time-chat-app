import type { Request, Response, NextFunction } from "express"
import prisma from "../../prisma/db"
import { getIO } from "../realtime/socketInstance"
import { emitToUser } from "../realtime/setupLobby"
import { asyncHandler } from "../utils"

interface OneToOneChatBody {
  friendId: number
}
interface GroupChatBody {
  friendIds: number[]
}
export interface AuthenticatedUser {
  id: number
  email: string
  name: string
}
export interface AuthenticatedRequest<T = any> extends Request {
  user?: AuthenticatedUser
  body: T
}

export const createOneToOneChat = asyncHandler(
  async (
    req: AuthenticatedRequest<OneToOneChatBody>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const { friendId } = req.body
    if (!friendId) {
      res.status(400).json({ error: "No friendId provided" })
      return
    }

    const result = await prisma.$transaction(async (ctx) => {
      const newChat = await ctx.chat.create({
        data: {
          type: "ONE_ON_ONE",
          participants: {
            create: [{ userId }, { userId: friendId }],
          },
        },
        include: {
          participants: true,
          notifications: true,
        },
      })

      const authUser = await ctx.user.findUnique({ where: { id: userId } })

      const notification = await ctx.notification.create({
        data: {
          userId: friendId,
          type: "CHAT_CREATED",
          message: `${authUser?.name} created a chat with you`,
          chatId: newChat.id,
        },
        include: { friendRequest: true },
      })
      const notifactionForAuthUser = await ctx.notification.create({
        data: {
          userId,
          type: "CHAT_CREATED",
          message: `You created a chat with you being part of it`,
          chatId: newChat.id,
        },
        include: { friendRequest: true },
      })
      return { newChat, notification, notifactionForAuthUser }
    })

    const io = getIO()

    emitToUser(io, friendId, "chatCreated", {
      chat: result.newChat,
      notification: result.notification,
    })
    emitToUser(io, userId, "chatCreated", {
      chat: result.newChat,
      notification: result.notifactionForAuthUser,
    })

    res
      .status(201)
      .json({ message: "Chat created successfully", chat: result.newChat })
  }
)

export const createGroupChat = asyncHandler(
  async (
    req: AuthenticatedRequest<GroupChatBody>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const { friendIds } = req.body

    if (!friendIds || friendIds.length === 0) {
      res.status(400).json({ error: "No friendIds provided" })
      return
    }

    const participants = [userId, ...friendIds]

    const result = await prisma.$transaction(async (ctx) => {
      const newChat = await ctx.chat.create({
        data: {
          type: "GROUP",
          participants: {
            create: participants.map((userId) => ({ userId })),
          },
        },
        include: {
          participants: { include: { user: true } },
        },
      })
      const authUser = await ctx.user.findUnique({
        where: { id: userId },
      })

      const notifications = await Promise.all(
        participants.map(async (id) => {
          return ctx.notification.create({
            data: {
              userId: id,
              type: "CHAT_CREATED",
              message: `${authUser?.name} created a group chat with you`,
              chatId: newChat.id,
            },
          })
        })
      )
      return { newChat, notifications }
    })

    const io = getIO()
    participants.forEach((pId) => {
      emitToUser(io, pId, "chatCreated", {
        chat: result.newChat,
        notification: result.notifications.find((n) => n.userId === pId),
      })
    })
    res
      .status(201)
      .json({ message: "Chat created successfully", chat: result.newChat })
  }
)

export const getChats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        notifications: true,
        lastMessage: { include: { sender: true, media: true } },
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
    res.status(200).json(chats)
  }
)

export const getChatById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const chatId = parseInt(req.params.chatId!)

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: true,
            media: true,
            notifications: true,
          },
        },
        lastMessage: { include: { media: true } },
      },
    })

    if (!chat) {
      res.status(404).json({ error: "Chat not found" })
      return
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId)

    if (!isParticipant) {
      res.status(403).json({ error: "You are not a participant of this chat" })
      return
    }
    res.status(200).json({ chat })
  }
)

export const deleteChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const chatId = parseInt(req.params.chatId!)
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: { participants: true },
    })
    if (!chat) {
      res.status(404).json({ error: "Chat not found" })
      return
    }

    const isParticipant = chat.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      res.status(403).json({
        error:
          "You are not a participant of this chat, so you are not allowed to delete it",
      })
      return
    }
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    })
    chat.participants.forEach((p) => {
      if (p.userId !== userId) {
        const io = getIO()
        emitToUser(io, p.userId, "chatDeleted", { chatId })
      }
    })
    res.status(200).json({ message: "Chat deleted successfully" })
  }
)
