import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, asyncHandler(getDashboardStats));

export default router;
