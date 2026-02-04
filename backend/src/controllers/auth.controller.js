import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const result = await AuthService.register(name, email, password, phone);

      return res.status(201).json(
        new ApiResponse(201, result, "User registered successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      return res.status(200).json(
        new ApiResponse(200, result, "Login successful")
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const userId = req.user._id;

      const user = await AuthService.getUserProfile(userId);

      return res.status(200).json(
        new ApiResponse(200, user, "Profile retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const updateData = req.body;

      const user = await AuthService.updateUserProfile(userId, updateData);

      return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}
