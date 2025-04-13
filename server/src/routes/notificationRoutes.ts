import { Router } from "express"
import { authenticateToken } from "../middleware/authenticateToken"
import {
  getNotification,
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController"
const router = Router()

router.get("/", authenticateToken, getNotifications)
router.get("/chat/:id/type/:type", authenticateToken, getNotification)
router.put("/:id/read", authenticateToken, markNotificationAsRead)

export default router
