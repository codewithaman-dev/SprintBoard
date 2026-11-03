import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { loginSchema, registerSchema } from "../utils/validators.js";

const cookieName = () => process.env.COOKIE_NAME || "sprintboard_session";

function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash });
  setSessionCookie(res, user._id);

  res.status(201).json({ success: true, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
  const valid = user && await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) throw new HttpError(401, "Email or password is incorrect.");

  setSessionCookie(res, user._id);
  res.json({ success: true, user: publicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(cookieName(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  res.json({ success: true, message: "You have signed out." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
