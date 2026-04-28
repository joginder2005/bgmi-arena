import crypto from "crypto";
import mongoose from "mongoose";
import razorpay, { razorpayConfigured } from "../config/razorpay.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const createDepositOrder = async (req, res) => {
  if (!razorpayConfigured || !razorpay) {
    return res.status(503).json({ message: "Wallet payments are not configured yet" });
  }

  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Valid amount is required" });
  }

  const options = {
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    receipt: `wallet_${req.user._id}_${Date.now()}`,
    payment_capture: 1,
  };

  const order = await razorpay.orders.create(options);

  await Transaction.create({
    userId: req.user._id,
    type: "deposit",
    amount: Number(amount),
    status: "pending",
    razorpayOrderId: order.id,
    metadata: {
      receipt: order.receipt,
    },
  });

  return res.status(201).json({
    message: "Razorpay order created",
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

export const verifyPayment = async (req, res) => {
  if (!razorpayConfigured) {
    return res.status(503).json({ message: "Wallet payments are not configured yet" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Payment verification fields are required" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: req.user._id },
      {
        status: "failed",
        razorpayPaymentId: razorpay_payment_id,
      }
    );
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user._id,
    }).session(session);

    if (!transaction) {
      throw new Error("Deposit transaction not found");
    }

    if (transaction.status === "success") {
      await session.abortTransaction();
      return res.json({ message: "Payment already verified" });
    }

    const user = await User.findById(req.user._id).session(session);
    user.walletBalance += transaction.amount;
    await user.save({ session });

    transaction.status = "success";
    transaction.razorpayPaymentId = razorpay_payment_id;
    await transaction.save({ session });

    await session.commitTransaction();
    return res.json({ message: "Payment verified and wallet updated", walletBalance: user.walletBalance });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: error.message || "Payment verification failed" });
  } finally {
    session.endSession();
  }
};

export const getWalletBalance = async (req, res) => {
  const user = await User.findById(req.user._id).select("walletBalance totalEarnings wins matchesPlayed");
  return res.json({ wallet: user });
};

export const getTransactionHistory = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ count: transactions.length, transactions });
};
