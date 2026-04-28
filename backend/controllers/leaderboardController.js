import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  const sortBy = req.query.sortBy || "earnings";

  const sortMap = {
    earnings: { totalEarnings: -1, wins: -1, kills: -1 },
    wins: { wins: -1, totalEarnings: -1, kills: -1 },
    kills: { kills: -1, totalEarnings: -1, wins: -1 },
  };

  const leaderboard = await User.find({}, "username bgmiId totalEarnings wins kills matchesPlayed")
    .sort(sortMap[sortBy] || sortMap.earnings)
    .limit(20);

  return res.json({ sortBy, leaderboard });
};
