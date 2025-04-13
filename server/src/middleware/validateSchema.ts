import type { Request, Response, NextFunction } from "express"
import type { AnyZodObject } from "zod"

export const validateSchema =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Hello from validateSchema: ", req.body)
      schema.parse({ body: req.body })
      next()
    } catch (error) {
      next(error)
    }
  }
