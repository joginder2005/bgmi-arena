import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { requireFields } from "../utils/validate.js";

export const register = async (req, res) => {
  const payload = {
    ...req.body,
    emailOrPhone: req.body.emailOrPhone || req.body.email || req.body.phone,
  };

  const requiredFields = ["username", "emailOrPhone", "password"];
  if (payload.role !== "admin") {
    requiredFields.push("bgmiId");
  }

  const missing = requireFields(payload, requiredFields);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
  }

  const { username, emailOrPhone, password, bgmiId, role, adminRegistrationKey } = payload;

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existingUser = await User.findOne({ emailOrPhone });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists with this email/phone" });
  }

  let finalRole = "player";
  if (role === "admin") {
    if (!adminRegistrationKey || adminRegistrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ message: "Invalid admin registration key" });
    }
    finalRole = "admin";
  }

  const user = await User.create({
    username,
    emailOrPhone,
    password,
    bgmiId: role === "admin" ? bgmiId || "ADMIN" : bgmiId,
    role: finalRole,
  });

  const token = generateToken(user._id, user.role);
  return res.status(201).json({
    message: "Registration successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      emailOrPhone: user.emailOrPhone,
      bgmiId: user.bgmiId,
      role: user.role,
      walletBalance: user.walletBalance,
    },
  });
};

export const login = async (req, res) => {
  const payload = {
    ...req.body,
    emailOrPhone: req.body.emailOrPhone || req.body.email || req.body.phone,
  };

  const missing = requireFields(payload, ["emailOrPhone", "password"]);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
  }

  const { emailOrPhone, password } = payload;
  const user = await User.findOne({ emailOrPhone });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id, user.role);
  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      emailOrPhone: user.emailOrPhone,
      bgmiId: user.bgmiId,
      role: user.role,
      walletBalance: user.walletBalance,
    },
  });
};

export const getProfile = async (req, res) => {
  return res.json({ user: req.user });
};
