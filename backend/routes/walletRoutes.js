import express from "express";
import {
  createDepositOrder,
  getTransactionHistory,
  getWalletBalance,
  verifyPayment,
} from "../controllers/walletController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/deposit/order", authMiddleware, asyncHandler(createDepositOrder));
router.post("/deposit/verify", authMiddleware, asyncHandler(verifyPayment));
router.get("/balance", authMiddleware, asyncHandler(getWalletBalance));
router.get("/transactions", authMiddleware, asyncHandler(getTransactionHistory));

export default router;
