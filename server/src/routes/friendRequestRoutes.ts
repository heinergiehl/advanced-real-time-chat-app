import { Router } from "express"
import { authenticateToken } from "../middleware/authenticateToken"
import {
  acceptFriendRequest,
  getFriends,
  sendFriendRequest,
} from "../controllers/friendRequestController"

const router = Router()

router.post("/", authenticateToken, sendFriendRequest)
router.put("/accept", authenticateToken, acceptFriendRequest)
router.get("/friends", authenticateToken, getFriends)

export default router
