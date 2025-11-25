import ApiError from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired, please refresh" });
  }

  res.status(500).json({ message: "Something went wrong" });
};
