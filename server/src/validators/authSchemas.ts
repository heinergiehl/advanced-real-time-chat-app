import { z } from "zod"

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name is too short").max(255, "Name is too long"),
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(3, "Password is too shirt")
        .max(255, "Password is too long"),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords don't match",
    }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(3, "Password is too shirt")
      .max(255, "Password is too long"),
  }),
})
