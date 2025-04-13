import type { Request, Response, NextFunction } from "express"

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error in error handling middleware: ", err.message)
  console.error(err.stack)
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    message: "Error from error handling middleware",
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  })
}
