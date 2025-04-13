import type { Request, Response, NextFunction } from "express"
import prisma from "../../prisma/db"
import { asyncHandler } from "../utils"
import { file } from "bun"

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) {
      res.status(400).json({ error: "User not found" })
      return
    }
    res.status(200).json({ user })
  }
)

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    const { name } = req.body

    const updateData: any = {
      name,
    }

    if (req.file) {
      const { filename } = req.file as any
      updateData.profile_image = filename
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },

      data: updateData,
    })

    const userWithoutPassword = { ...updatedUser, password: undefined }
    res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    })
  }
)
