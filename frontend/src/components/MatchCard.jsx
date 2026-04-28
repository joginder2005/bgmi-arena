import erangelMap from "../assets/maps/erangel.png";
import livikMap from "../assets/maps/livik.png";
import miramarMap from "../assets/maps/miramar.png";
import nusaMap from "../assets/maps/nusa.png";
import sanhokMap from "../assets/maps/sanhok.png";

const badgeClasses = {
  LIVE: "status-live",
  Open: "status-open",
  Upcoming: "status-upcoming",
};

const mapImages = {
  Erangel: erangelMap,
  Livik: livikMap,
  Miramar: miramarMap,
  Nusa: nusaMap,
  Sanhok: sanhokMap,
};

function MatchCard({ match, onJoin }) {
  const mapImage = mapImages[match.map];

  return (
    <article className="arena-card group overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-glow">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="relative overflow-hidden rounded-[1.5rem] md:h-[190px] md:w-[270px] md:flex-shrink-0">
          <img src={mapImage} alt={match.map} className="h-52 w-full object-cover md:h-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(9,13,22,0.68))]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur">
            {match.map}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">{match.title}</h3>
              <p className="mt-1 text-base text-arena-muted">
                {match.meta} · {match.map}
              </p>
              <span className={`arena-pill mt-4 border ${badgeClasses[match.status]}`}>
                {match.status}
              </span>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div>
                <div className="text-3xl font-bold text-arena-orange">₹{match.prizePool.toLocaleString("en-IN")}</div>
                <div className="text-base text-arena-muted">Entry: ₹{match.entryFee}</div>
                <div className="text-base text-arena-muted">Per Kill: ₹{match.perKillReward ?? 0}</div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary px-4 py-2">Spectate</button>
                <button type="button" onClick={() => onJoin?.(match)} className="btn-primary px-4 py-2">
                  {match.status === "LIVE" ? "Join" : "Join Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default MatchCard;
