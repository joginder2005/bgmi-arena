import { leaderboardData } from "../data/mockData";

function Leaderboard() {
  return (
    <section className="arena-card overflow-hidden">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-3xl font-bold text-white">Top Fraggers</h2>
        <p className="mt-1 text-lg text-arena-muted">Climb the BGMI Arena ranks and cash leaderboard.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-sm uppercase tracking-[0.24em] text-arena-muted">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Player Name</th>
              <th className="px-6 py-4">Kills</th>
              <th className="px-6 py-4">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player) => (
              <tr key={player.rank} className="border-t border-white/10 transition hover:bg-white/5">
                <td className="px-6 py-5 text-2xl font-bold text-white">#{player.rank}</td>
                <td className="px-6 py-5 text-xl font-semibold text-white">{player.player}</td>
                <td className="px-6 py-5 text-xl text-arena-muted">{player.kills}</td>
                <td className="px-6 py-5 text-xl font-bold text-arena-green">
                  ₹{player.earnings.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Leaderboard;
