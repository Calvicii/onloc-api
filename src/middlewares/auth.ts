import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient, type users } from "../generated/prisma"
import type { ExtendedError, Socket } from "socket.io"

const JWT_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "onloc-access-token-secret"

export interface AuthenticatedRequest extends Request {
  user: users
}

const prisma = new PrismaClient()

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof (decoded as any).userId === "string"
    ) {
      const user = await prisma.users.findFirstOrThrow({
        where: { id: decoded.userId },
      })
      if (user) {
        req.user = user
        next()
      } else {
        res.status(401).json({ message: "User not found" })
      }
    } else {
      res.status(401).json({ message: "Invalid token payload" })
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

export const authenticateIO = (
  socket: Socket,
  next: (error?: ExtendedError) => void
): void => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error("Invalid or expired token"))
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof (decoded as any).userId === "string"
    ) {
      prisma.users
        .findUnique({
          where: { id: decoded.userId },
        })
        .then((user) => {
          if (!user) {
            return next(new Error("User not found"))
          }
          socket.data.user = user
          socket.join(`user_${user.id}`)
          next()
        })
        .catch(() => next(new Error("User not found")))
    } else {
      next(new Error("Invalid token payload"))
    }
  } catch (error) {
    next(new Error("Invalid or expired token"))
  }
}
