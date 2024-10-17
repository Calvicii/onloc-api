import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserService } from "../services/userService.js";

export class UserController {
  constructor() {
    const usersPath = "./users.json";
    this.userService = new UserService(usersPath);
  }

  async login(username, password) {
    try {
      const user = this.userService
        .loadUsers()
        .find((user) => user.username === username);

      if (!user) {
        return { status: 401, error: "Invalid username or password" };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { status: 401, error: "Invalid username or password" };
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      return {
        status: 200,
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username },
      };
    } catch (error) {
      console.error("Error during login:", error);
      return { status: 500, error: "An error occurred during login" };
    }
  }
}
