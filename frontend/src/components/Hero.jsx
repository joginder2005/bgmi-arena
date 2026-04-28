import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { stats } from "../data/mockData";

function Hero() {
  const { isAuthenticated } = useAuth();
  const joinMatchPath = isAuthenticated ? "/matches" : "/login";

  return (
    <section className="arena-container pt-14 sm:pt-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.16),transparent_35%),linear-gradient(180deg,rgba(13,19,33,0.96),rgba(8,11,20,0.98))] shadow-glow">
        <div className="px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20">
          <span className="arena-pill border-orange-500/40 bg-orange-500/10 text-arena-orange">
            INDIA'S #1 BGMI PLATFORM
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Win Real <span className="text-arena-orange">Prize Money</span>
            <br />
            Play BGMI Tournaments
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-arena-muted sm:text-2xl">
            Join paid matches, compete with top players, and win real cash prizes directly to your wallet.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={joinMatchPath} className="btn-primary min-w-44">
              Join a Match
            </Link>
            <Link to="/matches" className="btn-secondary min-w-44">
              View Matches
            </Link>
          </div>
        </div>

        <div className="grid border-t border-orange-500/15 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-6 py-5 text-center ${index < stats.length - 1 ? "lg:border-r lg:border-orange-500/15" : ""} ${index % 2 === 0 ? "sm:border-r sm:border-orange-500/15" : ""}`}
            >
              <div className="text-4xl font-bold text-arena-orange">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
