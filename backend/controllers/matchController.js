import crypto from "crypto";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { requireFields } from "../utils/validate.js";

export const createMatch = async (req, res) => {
  const missing = requireFields(req.body, ["title", "type", "mode", "map", "entryFee", "prizePool", "totalSlots"]);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
  }

  const match = await Match.create({
    ...req.body,
    createdBy: req.user._id,
  });

  return res.status(201).json({ message: "Match created", match });
};

export const getAllMatches = async (req, res) => {
  const query = {};
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  const matches = await Match.find(query)
    .populate("createdBy", "username role")
    .populate("joinedPlayers", "username bgmiId")
    .sort({ createdAt: -1 });

  return res.json({ count: matches.length, matches });
};

export const joinMatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const match = await Match.findById(req.params.matchId).session(session);
    if (!match) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status === "completed") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Completed matches are locked" });
    }

    if (match.joinedPlayers.some((playerId) => playerId.toString() === req.user._id.toString())) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Player already joined this match" });
    }

    if (match.joinedPlayers.length >= match.totalSlots) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Match is full" });
    }

    const user = await User.findById(req.user._id).session(session);
    if (user.walletBalance < match.entryFee) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    user.walletBalance -= match.entryFee;
    user.matchesPlayed += 1;
    await user.save({ session });

    match.joinedPlayers.push(user._id);
    if (match.joinedPlayers.length > 0 && match.status === "upcoming") {
      match.status = "live";
    }
    await match.save({ session });

    await Transaction.create(
      [
        {
          userId: user._id,
          type: "entry_fee",
          amount: match.entryFee,
          status: "success",
          metadata: {
            matchId: match._id,
            title: match.title,
            reference: crypto.randomUUID(),
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return res.json({ message: "Joined match successfully", matchId: match._id, walletBalance: user.walletBalance });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: error.message || "Failed to join match" });
  } finally {
    session.endSession();
  }
};

export const updateMatch = async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  if (match.status === "completed") {
    return res.status(400).json({ message: "Completed matches are locked" });
  }

  Object.assign(match, req.body);
  await match.save();

  return res.json({ message: "Match updated", match });
};

export const deleteMatch = async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  if (match.status === "completed") {
    return res.status(400).json({ message: "Completed matches are locked and cannot be deleted" });
  }

  await match.deleteOne();
  return res.json({ message: "Match deleted" });
};

export const addRoomDetails = async (req, res) => {
  const missing = requireFields(req.body, ["roomId", "roomPassword"]);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
  }

  const match = await Match.findById(req.params.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  match.roomId = req.body.roomId;
  match.roomPassword = req.body.roomPassword;
  await match.save();

  return res.json({ message: "Room details updated", match });
};

export const getRoomDetails = async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  const joined = match.joinedPlayers.some((playerId) => playerId.toString() === req.user._id.toString());
  if (!joined) {
    return res.status(403).json({ message: "Only joined players can view room details" });
  }

  if (!match.roomId || !match.roomPassword) {
    return res.status(404).json({ message: "Room details not published yet" });
  }

  return res.json({
    matchId: match._id,
    title: match.title,
    roomId: match.roomId,
    roomPassword: match.roomPassword,
  });
};

export const distributePayout = async (req, res) => {
  const { winners } = req.body;
  if (!Array.isArray(winners) || !winners.length) {
    return res.status(400).json({ message: "Winners array is required" });
  }

  const match = await Match.findById(req.params.matchId);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  if (match.payoutProcessed) {
    return res.status(400).json({ message: "Payout already processed for this match" });
  }

  const totalDistributed = winners.reduce((sum, winner) => sum + Number(winner.amount || 0), 0);
  if (totalDistributed > match.prizePool) {
    return res.status(400).json({ message: "Distributed amount exceeds prize pool" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const winner of winners) {
      const user = await User.findById(winner.userId).session(session);
      if (!user) {
        throw new Error(`Winner user not found: ${winner.userId}`);
      }

      user.walletBalance += Number(winner.amount);
      user.totalEarnings += Number(winner.amount);
      user.wins += 1;
      user.kills += Number(winner.killsAwarded || 0);
      await user.save({ session });

      await Transaction.create(
        [
          {
            userId: user._id,
            type: "win",
            amount: Number(winner.amount),
            status: "success",
            metadata: {
              matchId: match._id,
              title: match.title,
            },
          },
        ],
        { session }
      );
    }

    match.winners = winners.map((winner) => ({
      user: winner.userId,
      amount: Number(winner.amount),
      killsAwarded: Number(winner.killsAwarded || 0),
    }));
    match.payoutProcessed = true;
    match.status = "completed";
    await match.save({ session });

    await session.commitTransaction();
    return res.json({ message: "Prize pool distributed successfully", match });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: error.message || "Failed to process payout" });
  } finally {
    session.endSession();
  }
};
