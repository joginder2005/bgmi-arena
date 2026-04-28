export const stats = [
  { label: "Players", value: "12,400+" },
  { label: "Paid Out", value: "Rs8.2L" },
  { label: "Matches", value: "340+" },
  { label: "Payout Rate", value: "98%" },
];

export const upcomingMatches = [
  {
    id: 1,
    title: "Erangel Classic - Squad",
    map: "Erangel",
    entryFee: 50,
    prizePool: 5000,
    status: "LIVE",
    meta: "Today 8:00 PM · 100 players",
  },
  {
    id: 2,
    title: "Miramar Solo Showdown",
    map: "Miramar",
    entryFee: 100,
    prizePool: 10000,
    status: "Upcoming",
    meta: "Today 10:00 PM · Solo lobby",
  },
  {
    id: 3,
    title: "Sanhok Rush Cup",
    map: "Sanhok",
    entryFee: 75,
    prizePool: 7500,
    status: "Ended",
    meta: "Yesterday 7:30 PM · Match completed",
  },
];

export const matchTabs = ["Classic", "TDM"];
export const matchFilters = ["4v4", "2v2", "1v1", "Entry < Rs100"];

export const classicMatches = [
  {
    id: 11,
    title: "Erangel Classic Squad",
    map: "Erangel",
    entryFee: 80,
    perKillReward: 25,
    prizePool: 8000,
    status: "Open",
    meta: "Squad · 64 teams",
  },
  {
    id: 12,
    title: "Livik Blitz Cup",
    map: "Livik",
    entryFee: 49,
    perKillReward: 15,
    prizePool: 4000,
    status: "Upcoming",
    meta: "Duo · Starts in 3h",
  },
  {
    id: 13,
    title: "Miramar Desert Clash",
    map: "Miramar",
    entryFee: 99,
    perKillReward: 35,
    prizePool: 12000,
    status: "LIVE",
    meta: "Squad · Hot drop finals",
  },
  {
    id: 14,
    title: "Nusa Quick Rush",
    map: "Nusa",
    entryFee: 39,
    perKillReward: 10,
    prizePool: 3000,
    status: "Open",
    meta: "Duo · Fast matches",
  },
  {
    id: 15,
    title: "Sanhok Jungle Showdown",
    map: "Sanhok",
    entryFee: 59,
    perKillReward: 20,
    prizePool: 5500,
    status: "Upcoming",
    meta: "Squad · Evening room",
  },
];

export const tdmMatches = [
  {
    id: 21,
    title: "TDM",
    prizePool: "Rs2,500",
    status: "LIVE",
    teams: [
      { name: "Inferno", players: [true, true, true, false], kills: 23 },
      { name: "Recoil", players: [true, true, false, false], kills: 19 },
    ],
  },
  {
    id: 22,
    title: "Kameshki 5v5",
    prizePool: "Rs1,800",
    status: "Open",
    teams: [
      { name: "HeadHunters", players: [true, true, true, true, false], kills: 0 },
      { name: "NightRaid", players: [true, true, false, false, false], kills: 0 },
    ],
  },
];

export const leaderboardData = [
  { rank: 1, player: "SnipeKing", kills: 184, earnings: 56200 },
  { rank: 2, player: "RushBolt", kills: 171, earnings: 48800 },
  { rank: 3, player: "ShadowXD", kills: 148, earnings: 42100 },
  { rank: 4, player: "ClutchQueen", kills: 137, earnings: 36900 },
  { rank: 5, player: "Revenant", kills: 126, earnings: 31400 },
];

export const transactions = [
  { id: 1, type: "Deposit", amount: "+Rs1,000", status: "Success", time: "Today, 09:32 PM" },
  { id: 2, type: "Entry Fee", amount: "-Rs50", status: "Success", time: "Today, 08:12 PM" },
  { id: 3, type: "Winnings", amount: "+Rs850", status: "Success", time: "Yesterday, 11:48 PM" },
  { id: 4, type: "Withdrawal", amount: "-Rs500", status: "Pending", time: "Yesterday, 07:10 PM" },
];

export const adminSidebar = ["Dashboard", "Create Match", "All Matches", "Players", "Payouts", "Room Codes"];

export const adminStats = [
  { label: "Total Revenue", value: "Rs3.8L", accent: "orange" },
  { label: "Active Matches", value: "28", accent: "green" },
  { label: "Players Today", value: "1,482", accent: "orange" },
  { label: "Pending Payouts", value: "14", accent: "red" },
];

export const adminMatches = [
  {
    id: "MAT-1082",
    title: "Warehouse Finals",
    entryFee: 99,
    prizePool: 4000,
    status: "live",
    locked: false,
  },
  {
    id: "MAT-1083",
    title: "Erangel Elite",
    entryFee: 60,
    prizePool: 6500,
    status: "upcoming",
    locked: false,
  },
  {
    id: "MAT-1084",
    title: "Champions TDM",
    entryFee: 120,
    prizePool: 9000,
    status: "completed",
    locked: true,
  },
];
