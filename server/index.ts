import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import path from "path"
import { errorHandler } from "./src/middleware/errorHandler"
import { asyncHandler } from "./src/utils"
import authRoutes from "./src/routes/authRoutes"
import profileRoutes from "./src/routes/profileRoutes"
import http from "http"
import { Server } from "socket.io"
import { setIO } from "./src/realtime/socketInstance"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { setupLobby } from "./src/realtime/setupLobby"
import friendRequestRoutes from "./src/routes/friendRequestRoutes"
import notificationRoutes from "./src/routes/notificationRoutes"
import chatRoutes from "./src/routes/chatRoutes"
import { setupChatRoom } from "./src/realtime/setupChatRoom"
const app = express()
const port = process.env.PORT!
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)
app.use("/storage", express.static(path.join(__dirname, "./storage")))

//henlo world
app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ message: "Hello World!" })
  })
)

app.use("/api", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/friend-request", friendRequestRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/chats", chatRoutes)

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["*"],
    credentials: true,
  },
})
setIO(io)
io.use((socket, next) => {
  const cookies = socket.request.headers.cookie
  if (!cookies) {
    return next(new Error("Authentication error"))
  }
  const parsedCookie = cookie.parse(cookies)
  const token = parsedCookie.token
  if (!token) {
    return next(new Error("Authentication error"))
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"))
    }
    socket.data.user = decoded
    next()
  })
})

setupLobby(io)
setupChatRoom(io)
app.use(errorHandler)

httpServer.listen(port, () => {
  console.log(`Badass real time chat app backend listening on port ${port}!!!`)
})
