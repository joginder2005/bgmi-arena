import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import JoinMatchModal from "../components/JoinMatchModal";
import MatchCard from "../components/MatchCard";
import { adaptClassicMatch, fetchMatches } from "../utils/matches";

const statusTabs = ["Upcoming", "Live", "Ended"];

function HomePage() {
  const [activeStatus, setActiveStatus] = useState("Upcoming");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchMatches();
      setMatches(data.filter((match) => match.type === "classic").map(adaptClassicMatch));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const visibleMatches = matches.filter((match) => {
    if (activeStatus === "Live") {
      return match.status === "LIVE";
    }

    return match.status === activeStatus;
  });

  return (
    <div className="pb-16">
      <Hero />
      <section className="arena-container mt-14">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white">Matches</h2>
            <p className="mt-2 text-lg text-arena-muted">Pick a match, pay entry, and get room code 30 min before.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusTabs.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`rounded-2xl px-5 py-3 text-base font-bold transition ${
                  activeStatus === status
                    ? "bg-orange-500 text-white shadow-glow"
                    : "border border-white/10 bg-white/5 text-arena-muted hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {loading ? <div className="arena-card p-8 text-center text-arena-muted">Loading matches...</div> : null}
          {!loading && error ? <div className="arena-card p-8 text-center text-red-200">{error}</div> : null}
          {!loading && !error && !visibleMatches.length ? (
            <div className="arena-card p-8 text-center text-arena-muted">No {activeStatus.toLowerCase()} matches right now.</div>
          ) : null}
          {!loading && !error
            ? visibleMatches.map((match) => <MatchCard key={match.id} match={match} onJoin={setSelectedMatch} />)
            : null}
        </div>
      </section>
      <JoinMatchModal
        match={selectedMatch}
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        onJoined={loadMatches}
      />
    </div>
  );
}

export default HomePage;
