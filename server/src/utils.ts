import type { Request, Response, NextFunction } from "express"

type AsyncControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

export function asyncHandler(fn: AsyncControllerHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}
