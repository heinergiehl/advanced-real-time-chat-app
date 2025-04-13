import type { Server, Socket } from "socket.io"
import {
  broadcastOnlineUsersToChatRoom,
  broadcastOnlineUsersToLobby,
  deleteSocketIdAndUserFromMemory,
  updateUserInMemory,
} from "./setupLobby"
import prisma from "../../prisma/db"

export function setupChatRoom(io: Server): void {
  console.log("Setting up setupChatRoom")
  io.on("connection", (socket: Socket) => {
    socket.on(
      "joinChat",
      async (
        { chatId }: { chatId: number },
        callback?: (ack: { success: boolean; message?: string }) => void
      ) => {
        socket.join(chatId.toString())

        const user = socket.data.user
        console.log(`User ${user?.id} joined chat ${chatId}`)
        const fullUser = await prisma.user.findUnique({
          where: { id: user?.id },
        })
        if (!fullUser) {
          if (callback) callback({ success: false, message: "User not found" })
          return
        }
        // Update user in memory.
        const userData = {
          id: fullUser.id,
          name: fullUser.name,
          profile_image: fullUser.profile_image,
          chatId,
        }

        // Notify other users in the chat room.
        socket.to(chatId.toString()).emit("userJoined", {
          userId: fullUser.id,
          name: fullUser.name,
          profile_image: fullUser.profile_image,
          chatId,
        })
        updateUserInMemory(fullUser.id, userData)
        broadcastOnlineUsersToChatRoom(io, chatId)
        broadcastOnlineUsersToLobby(io)
        callback?.({ success: true, message: "Joined chat successfully" })
      }
    )

    socket.on(
      "leaveChat",
      async (
        { chatId }: { chatId: number },
        callback: (ack: { success: boolean; message?: string }) => void
      ) => {
        const user = socket.data.user
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        if (!fullUser) {
          console.log("User not found")
          return callback({
            success: false,
            message: "User not found",
          })
        }
        // Notify other users that this user has left the chat.
        socket.to(chatId.toString()).emit("userLeft", {
          userId: fullUser.id,
          name: fullUser.name,
          profile_image: fullUser.profile_image,
          chatId: undefined,
        })
        socket.leave(chatId.toString())
        console.log(`User ${user?.id} left chat ${chatId}`)
        updateUserInMemory(fullUser.id, { chatId: undefined })
        broadcastOnlineUsersToChatRoom(io, chatId)
        broadcastOnlineUsersToLobby(io)
        return callback({
          success: true,
          message: "Left chat successfully",
        })
      }
    )

    socket.on("typing", (payload: { chatId: number; isTyping: boolean }) => {
      const { chatId, isTyping } = payload
      const user = socket.data.user
      console.log(`User ${user?.id} is typing in chat ${chatId}`)
      socket.to(chatId.toString()).emit("typingIndicator", {
        userId: user?.id,
        name: user?.name,
        isTyping,
      })
    })

    socket.on(
      "logout",
      async (
        {},
        callback: (ack: { success: boolean; message?: string }) => void
      ) => {
        const user = socket.data.user
        deleteSocketIdAndUserFromMemory(socket, io)
        if (user.chatId) {
          // Notify other chat users the user is leaving:
          socket.to(user.chatId.toString()).emit("userLeft", {
            userId: user.id,
            name: user.name,
            profile_image: user.profile_image,
            chatId: undefined,
          })
          socket.leave(user.chatId.toString())
          // Update in-memory data:
          updateUserInMemory(user.id, { chatId: undefined })
          broadcastOnlineUsersToChatRoom(io, user.chatId)
        }
        console.log(`User ${user?.id} logged out in setupChat`)
        callback?.({
          success: true,
          message: "User logged out successfully",
        })
      }
    )
  })
}
