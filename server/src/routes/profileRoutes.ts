import path from "path"
import fs from "fs"
import multer from "multer"
import { Router } from "express"
import { authenticateToken } from "../middleware/authenticateToken"
import { getProfile, updateProfile } from "../controllers/profileController"

const storageFolderPath = path.join(__dirname, "../../storage")

if (!fs.existsSync(storageFolderPath)) {
  fs.mkdirSync(storageFolderPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageFolderPath)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ storage })
const router = Router()
router.get("/", authenticateToken, getProfile)

router.put("/", authenticateToken, upload.single("profileFile"), updateProfile)

export default router
