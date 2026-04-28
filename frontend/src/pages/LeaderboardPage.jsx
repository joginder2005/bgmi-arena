import Leaderboard from "../components/Leaderboard";

function LeaderboardPage() {
  return (
    <section className="arena-container py-12">
      <div className="mb-6">
        <span className="arena-pill border-green-400/30 bg-green-400/10 text-arena-green">Leaderboard</span>
        <h1 className="mt-4 text-5xl font-bold text-white">Prize Leaders</h1>
      </div>
      <Leaderboard />
    </section>
  );
}

export default LeaderboardPage;
