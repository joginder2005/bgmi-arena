import kameshkiMap from "../assets/maps/kameshki-5v5.png";
import tdmMap from "../assets/maps/tdm.png";

function Slot({ filled }) {
  return (
    <div
      className={`h-9 w-9 rounded-xl border ${
        filled
          ? "border-orange-400/40 bg-orange-500/20 shadow-[0_0_14px_rgba(255,106,0,0.35)]"
          : "border-white/10 bg-white/5"
      }`}
    />
  );
}

const matchImages = {
  TDM: tdmMap,
  "Kameshki 5v5": kameshkiMap,
};

function TDMCard({ match, onJoin }) {
  const [leftTeam, rightTeam] = match.teams;
  const totalKills = Math.max(leftTeam.kills + rightTeam.kills, 1);
  const leftWidth = `${(leftTeam.kills / totalKills) * 100}%`;
  const matchImage = matchImages[match.title] || tdmMap;

  const statusClass =
    match.status === "LIVE"
      ? "status-live"
      : match.status === "Open"
        ? "status-open"
        : "status-upcoming";

  return (
    <article className="arena-card overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-500/35 hover:shadow-glow">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="relative overflow-hidden rounded-[1.5rem] lg:h-[220px] lg:w-[320px] lg:flex-shrink-0">
            <img src={matchImage} alt={match.title} className="h-52 w-full object-cover lg:h-full" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(9,13,22,0.72))]" />
            <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur">
              {match.title}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">TDM Arena</div>
                <h3 className="mt-2 text-3xl font-bold text-white">{match.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`arena-pill border ${statusClass}`}>{match.status}</span>
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-2xl font-bold text-arena-orange">
                  {match.prizePool}
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
              <div className="arena-card border-white/5 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-bold">{leftTeam.name}</h4>
                  <span className="text-3xl font-bold text-arena-orange">{leftTeam.kills}</span>
                </div>
                <div className="mt-4 flex gap-2">{leftTeam.players.map((filled, index) => <Slot key={index} filled={filled} />)}</div>
              </div>

              <div className="text-center text-2xl font-bold uppercase tracking-[0.3em] text-arena-muted">VS</div>

              <div className="arena-card border-white/5 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-bold">{rightTeam.name}</h4>
                  <span className="text-3xl font-bold text-arena-green">{rightTeam.kills}</span>
                </div>
                <div className="mt-4 flex gap-2">{rightTeam.players.map((filled, index) => <Slot key={index} filled={filled} />)}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">
            <span>Kills Progress</span>
            <span>
              {leftTeam.kills} - {rightTeam.kills}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#ff6a00,#ff9a4d)] shadow-[0_0_16px_rgba(255,106,0,0.55)]"
              style={{ width: leftWidth }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => onJoin?.(match)} className="btn-primary flex-1">
            Join Team
          </button>
          <button className="btn-secondary flex-1">Spectate</button>
        </div>
      </div>
    </article>
  );
}

export default TDMCard;
