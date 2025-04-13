import type { Request, Response, NextFunction } from "express"
import prisma from "../../prisma/db"
import type { NotificationType } from "@prisma/client"
import { asyncHandler } from "../utils"

export const getNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        friendRequest: {
          include: { sender: true },
        },
        chatMessage: {
          include: {
            chat: true,
          },
        },
      },
    })
    res.status(200).json(notifications)
  }
)

export const getNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.id
    if (!chatId) {
      res.status(400).json({ error: "Bad Request" })
      return
    }
    const parsedChatId = parseInt(chatId)
    const notifactionType = req.params.type
    const userId = req.user?.id
    if (!notifactionType || !userId) {
      res.status(400).json({ error: "Bad Request" })
      return
    }
    const notification = await prisma.notification.findMany({
      where: {
        chatId: parsedChatId,
        type: notifactionType as NotificationType,
        userId,
      },
    })
    if (!notification) {
      res.status(404).json({ error: "Notification not found" })
      return
    }
    res.status(200).json(notification)
  }
)

export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const notificationId = req.params.id
    if (!notificationId) {
      res.status(400).json({ error: "Bad Request" })
      return
    }
    const parsedNotificationId = parseInt(notificationId)
    const notification = await prisma.notification.findUnique({
      where: {
        id: parsedNotificationId,
      },
    })
    if (!notification) {
      res.status(404).json({ error: "Notification not found" })
      return
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        read: true,
      },
    })
    res.status(200).json({ notification: updatedNotification })
  }
)
