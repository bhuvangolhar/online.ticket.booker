import { db, saveCollection } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { DB_CONSTANTS, USER_ROLES } from "../utils/constants.js";

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class AuthService {
  static async register(name, email, password, phone = "") {
    // Validate input
    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email, and password are required");
    }

    // Check if user already exists
    const existingUser = db.users.find((u) => u.email === email);
    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    // Simple hash simulation (in production use bcryptjs properly)
    const hashedPassword = Buffer.from(password).toString("base64");

    const user = {
      _id: generateId(),
      name,
      email,
      password: hashedPassword,
      phone,
      role: USER_ROLES.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.users.push(user);
    saveCollection("users");

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Verify password (simple base64 comparison for now)
    const hashedPassword = Buffer.from(password).toString("base64");
    if (user.password !== hashedPassword) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async getUserProfile(userId) {
    const user = db.users.find((u) => u._id === userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  static async updateUserProfile(userId, updateData) {
    const { name, phone } = updateData;

    const user = db.users.find((u) => u._id === userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    user.updatedAt = new Date();

    saveCollection("users");

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  static generateToken(user) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        _id: user._id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      })
    );
    const signature = btoa(user._id); // Simple signature for demo

    return `${header}.${payload}.${signature}`;
  }
}
