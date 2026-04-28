import express from "express";
import { getProfile, login, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/profile", authMiddleware, asyncHandler(getProfile));

export default router;
