import { useEffect, useState } from "react";
import JoinMatchModal from "../components/JoinMatchModal";
import MatchCard from "../components/MatchCard";
import TDMCard from "../components/TDMCard";
import { matchTabs } from "../data/mockData";
import { adaptClassicMatch, adaptTdmMatch, fetchMatches } from "../utils/matches";

const statusTabs = ["Upcoming", "Live", "Ended"];

function MatchesPage() {
  const [activeTab, setActiveTab] = useState("Classic");
  const [activeStatus, setActiveStatus] = useState("Upcoming");
  const [classicMatches, setClassicMatches] = useState([]);
  const [tdmMatches, setTdmMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const isClassicTab = activeTab === "Classic";
  const matches = isClassicTab ? classicMatches : tdmMatches;

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMatches();
        setClassicMatches(data.filter((match) => match.type === "classic").map(adaptClassicMatch));
        setTdmMatches(data.filter((match) => match.type === "tdm").map(adaptTdmMatch));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const refreshMatches = async () => {
    try {
      const data = await fetchMatches();
      setClassicMatches(data.filter((match) => match.type === "classic").map(adaptClassicMatch));
      setTdmMatches(data.filter((match) => match.type === "tdm").map(adaptTdmMatch));
    } catch {}
  };

  const visibleMatches = matches.filter((match) => {
    if (activeStatus === "Live") {
      return match.status === "LIVE";
    }

    if (activeStatus === "Upcoming") {
      return match.status === "Upcoming" || match.status === "Open";
    }

    return match.status === "Ended";
  });

  return (
    <section className="arena-container py-12">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="arena-pill border-orange-500/30 bg-orange-500/10 text-arena-orange">Matches Hub</span>
          <h1 className="mt-4 text-5xl font-bold text-white">
            {isClassicTab ? "Classic Battle Royale Matches" : "TDM Face-Off Matches"}
          </h1>
          <p className="mt-2 text-xl text-arena-muted">
            {isClassicTab
              ? "Browse big-map lobbies across Erangel, Livik, Miramar, Nusa, and Sanhok."
              : "Switch into close-range team fights and join your next TDM room."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {matchTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-5 py-3 text-lg font-bold transition ${
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-glow"
                  : "border border-white/10 bg-white/5 text-arena-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
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

      {loading ? (
        <div className="arena-card p-8 text-center text-arena-muted">Loading matches...</div>
      ) : error ? (
        <div className="arena-card p-8 text-center text-red-200">{error}</div>
      ) : visibleMatches.length ? (
        isClassicTab ? (
          <div className="space-y-4">
            {visibleMatches.map((match) => (
              <MatchCard key={match.id} match={match} onJoin={setSelectedMatch} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMatches.map((match) => (
              <TDMCard key={match.id} match={match} onJoin={setSelectedMatch} />
            ))}
          </div>
        )
      ) : (
        <div className="arena-card p-8 text-center">
          <h3 className="text-2xl font-bold text-white">No {activeStatus.toLowerCase()} matches</h3>
          <p className="mt-2 text-arena-muted">
            {isClassicTab ? "Classic" : "TDM"} matches will appear here when they are available.
          </p>
        </div>
      )}
      <JoinMatchModal
        match={selectedMatch}
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        onJoined={refreshMatches}
      />
    </section>
  );
}

export default MatchesPage;
