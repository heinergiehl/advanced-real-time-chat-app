import { Router } from "express"
import { validateSchema } from "../middleware/validateSchema"
import { loginSchema, registerSchema } from "../validators/authSchemas"

import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController"
import { authenticateToken } from "../middleware/authenticateToken"
const router = Router()

router.post("/register", validateSchema(registerSchema), registerUser)
router.post("/login", validateSchema(loginSchema), loginUser)
router.post("/logout", authenticateToken, logoutUser)

export default router
