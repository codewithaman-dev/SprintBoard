import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[process.env.COOKIE_NAME || "sprintboard_session"];
  if (!token) throw new HttpError(401, "Please sign in to continue.");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }

  const user = await User.findById(payload.sub).select("_id name email");
  if (!user) throw new HttpError(401, "Account not found. Please sign in again.");
  req.user = user;
  next();
});
