import { Server } from "socket.io"
let io: Server | null = null

export function setIO(ioInstance: Server) {
  io = ioInstance
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io instance not available")
  }
  return io
}
