import { prismaClient } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface createUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salt?: string; // Optional salt field
}

export interface getUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static async generateHash(password: string, salt: string) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
  }
  public static async createUser(payload: createUserPayload): Promise<string> {
    const { firstName, lastName, email, password } = payload;

    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      // Hash the password
      const { hashedPassword } = await UserService.generateHash(password, salt);
      // Create user in database
      const user = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          salt, // Adding the missing salt field
        },
      });

      return user.id; // Return the user ID as string
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  private static async getUserByEmail(email: string) {
    return await prismaClient.user.findUnique({
      where: { email },
    });
  }

  public static async getUserToken(payload: getUserTokenPayload) {
    const { email, password } = payload;

    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const userSalt = user.salt;
      const { hashedPassword } = await UserService.generateHash(
        password,
        userSalt
      );

      if (user.password !== hashedPassword) {
        throw new Error("Invalid password");
      }

      // return user.id;
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "default_secret", // Use a default secret if not set
        { expiresIn: "1h" }
      );
      console.log("Generated Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting user token:", error);
      throw new Error("Failed to get user token");
    }
  }

  public static decodeToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret" // Use a default secret if not set
      ) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      throw new Error("Failed to decode token");
    }
  }
}

export default UserService;
