import type { Request, Response, NextFunction } from "express"

import jwt from "jsonwebtoken"
import prisma from "../../prisma/db"
import { asyncHandler } from "../utils"

export const registerUser = asyncHandler(
  async (
    req: Request<
      {},
      {},
      {
        name: string
        email: string
        password: string
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (existingUser) {
      res.status(400).json({ message: "User already exists" })
      return
    }
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    })
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7days" }
    )

    res.cookie("token", token, {
      httpOnly: true,
    })
    res.status(201).json({
      message: "User registered successfully",
    })
  }
)

export const loginUser = asyncHandler(
  async (
    req: Request<
      {},
      {},
      {
        email: string
        password: string
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!existingUser) {
      res
        .status(400)
        .json({ message: "You have probably provived a wrong email" })
      return
    }

    const isMatch = existingUser.password === password
    if (!isMatch) {
      res.status(400).json({ message: "Probably wrong password" })
      return
    }
    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7days" }
    )

    res.cookie("token", token, {
      httpOnly: true,
    })

    res.status(200).json({
      message: "User logged in successfully",
    })
  }
)

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("token")
    res.status(200).json({
      message: "User logged out successfully",
    })
  }
)
