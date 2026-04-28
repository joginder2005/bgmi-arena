import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    killsAwarded: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["classic", "tdm"], required: true },
    mode: {
      type: String,
      enum: ["solo", "duo", "squad", "4v4", "2v2", "1v1"],
      required: true,
    },
    map: { type: String, required: true, trim: true },
    entryFee: { type: Number, required: true, min: 0 },
    perKillReward: { type: Number, default: 0, min: 0 },
    prizePool: { type: Number, required: true, min: 0 },
    totalSlots: { type: Number, required: true, min: 2 },
    joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roomId: { type: String, default: "" },
    roomPassword: { type: String, default: "" },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    winners: [winnerSchema],
    payoutProcessed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
