import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";

export const requestWithdrawal = async (req, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  const user = await User.findById(req.user._id);
  if (user.walletBalance < Number(amount)) {
    return res.status(400).json({ message: "Insufficient balance for withdrawal" });
  }

  const pending = await Withdrawal.findOne({ userId: req.user._id, status: "pending" });
  if (pending) {
    return res.status(400).json({ message: "A withdrawal request is already pending" });
  }

  const withdrawal = await Withdrawal.create({
    userId: req.user._id,
    amount: Number(amount),
    status: "pending",
  });

  return res.status(201).json({ message: "Withdrawal request submitted", withdrawal });
};

export const reviewWithdrawal = async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  const withdrawal = await Withdrawal.findById(req.params.withdrawalId);
  if (!withdrawal) {
    return res.status(404).json({ message: "Withdrawal request not found" });
  }

  if (withdrawal.status !== "pending") {
    return res.status(400).json({ message: "Withdrawal request already processed" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (status === "approved") {
      const user = await User.findById(withdrawal.userId).session(session);
      if (user.walletBalance < withdrawal.amount) {
        throw new Error("User no longer has enough wallet balance");
      }

      user.walletBalance -= withdrawal.amount;
      await user.save({ session });

      await Transaction.create(
        [
          {
            userId: user._id,
            type: "withdrawal",
            amount: withdrawal.amount,
            status: "success",
            metadata: {
              withdrawalId: withdrawal._id,
            },
          },
        ],
        { session }
      );
    }

    withdrawal.status = status;
    await withdrawal.save({ session });

    await session.commitTransaction();
    return res.json({ message: `Withdrawal ${status}`, withdrawal });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: error.message || "Failed to process withdrawal" });
  } finally {
    session.endSession();
  }
};

export const getWithdrawals = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };
  const withdrawals = await Withdrawal.find(query).populate("userId", "username emailOrPhone").sort({ createdAt: -1 });
  return res.json({ count: withdrawals.length, withdrawals });
};
