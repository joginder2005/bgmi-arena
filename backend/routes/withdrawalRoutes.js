import express from "express";
import {
  getWithdrawals,
  requestWithdrawal,
  reviewWithdrawal,
} from "../controllers/withdrawalController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getWithdrawals));
router.post("/", authMiddleware, asyncHandler(requestWithdrawal));
router.patch("/:withdrawalId", authMiddleware, adminMiddleware, asyncHandler(reviewWithdrawal));

export default router;
