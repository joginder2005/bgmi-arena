import express from "express";
import {
  addRoomDetails,
  createMatch,
  deleteMatch,
  distributePayout,
  getAllMatches,
  getRoomDetails,
  joinMatch,
  updateMatch,
} from "../controllers/matchController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getAllMatches));
router.post("/", authMiddleware, adminMiddleware, asyncHandler(createMatch));
router.post("/:matchId/join", authMiddleware, asyncHandler(joinMatch));
router.put("/:matchId", authMiddleware, adminMiddleware, asyncHandler(updateMatch));
router.delete("/:matchId", authMiddleware, adminMiddleware, asyncHandler(deleteMatch));
router.put("/:matchId/room", authMiddleware, adminMiddleware, asyncHandler(addRoomDetails));
router.get("/:matchId/room", authMiddleware, asyncHandler(getRoomDetails));
router.post("/:matchId/payout", authMiddleware, adminMiddleware, asyncHandler(distributePayout));

export default router;
