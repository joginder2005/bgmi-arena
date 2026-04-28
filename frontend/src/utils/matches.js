const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function normaliseStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "live") {
    return "LIVE";
  }

  if (value === "completed" || value === "ended") {
    return "Ended";
  }

  if (value === "open") {
    return "Open";
  }

  return "Upcoming";
}

export function buildMatchMeta(match) {
  const bits = [];

  if (match.mode) {
    bits.push(String(match.mode).toUpperCase());
  }

  if (typeof match.totalSlots === "number") {
    bits.push(`${match.totalSlots} slots`);
  }

  if (Array.isArray(match.joinedPlayers) && match.joinedPlayers.length) {
    bits.push(`${match.joinedPlayers.length} joined`);
  }

  return bits.join(" · ");
}

export function adaptClassicMatch(match) {
  return {
    id: match._id,
    title: match.title,
    map: match.map,
    entryFee: Number(match.entryFee || 0),
    perKillReward: Number(match.perKillReward || 0),
    prizePool: Number(match.prizePool || 0),
    status: normaliseStatus(match.status),
    meta: buildMatchMeta(match),
  };
}

export function adaptTdmMatch(match) {
  const joinedCount = Array.isArray(match.joinedPlayers) ? match.joinedPlayers.length : 0;
  const filledSlots = Math.min(joinedCount, Number(match.totalSlots || 8));
  const teamSize = Math.max(Math.ceil(Number(match.totalSlots || 8) / 2), 1);

  const firstTeamFilled = Math.min(filledSlots, teamSize);
  const secondTeamFilled = Math.max(filledSlots - teamSize, 0);

  return {
    id: match._id,
    title: match.title,
    prizePool: `₹${Number(match.prizePool || 0).toLocaleString("en-IN")}`,
    status: normaliseStatus(match.status),
    teams: [
      {
        name: "Team A",
        players: Array.from({ length: teamSize }, (_, index) => index < firstTeamFilled),
        kills: 0,
      },
      {
        name: "Team B",
        players: Array.from({ length: teamSize }, (_, index) => index < secondTeamFilled),
        kills: 0,
      },
    ],
  };
}

export async function fetchMatches() {
  const response = await fetch(`${API_BASE_URL}/api/matches`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to load matches");
  }

  return data.matches || [];
}
