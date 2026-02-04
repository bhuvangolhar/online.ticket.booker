import jwt from "jsonwebtoken";
import { DB_CONSTANTS } from "../utils/constants.js";
import { ApiError } from "../utils/ApiError.js";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "No token provided");
    }

    const decoded = jwt.verify(token, DB_CONSTANTS.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Invalid or expired token"));
    }
  }
};
