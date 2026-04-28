import Match from "../models/Match.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";

export const getDashboardStats = async (req, res) => {
  const [entryFeeAggregate, activeMatches, totalUsers, pendingWithdrawals] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          type: "entry_fee",
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]),
    Match.countDocuments({ status: { $in: ["upcoming", "live"] } }),
    User.countDocuments(),
    Withdrawal.countDocuments({ status: "pending" }),
  ]);

  return res.json({
    totalRevenue: entryFeeAggregate[0]?.totalRevenue || 0,
    activeMatches,
    totalUsers,
    pendingWithdrawals,
  });
};
