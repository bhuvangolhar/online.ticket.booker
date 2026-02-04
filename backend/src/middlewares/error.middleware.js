import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation Error", errors);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ApiError(400, `${field} already exists`);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  // Handle Mongoose cast error
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}`);
  }

  // Default error
  if (!(error instanceof ApiError)) {
    error = new ApiError(500, error.message || "Internal Server Error");
  }

  const response = new ApiResponse(
    error.statusCode || 500,
    null,
    error.message
  );

  return res.status(error.statusCode || 500).json(response);
};
