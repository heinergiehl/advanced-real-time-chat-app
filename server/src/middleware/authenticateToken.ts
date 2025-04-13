import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token
  if (!token) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  jwt.verify(token, process.env.JWT_SECRET!, (error: any, user: any) => {
    if (error) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
    req.user = user
    next()
  })
}
