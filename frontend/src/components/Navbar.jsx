import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Matches", to: "/matches" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Wallet", to: "/wallet" },
];

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-orange-500/15 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="arena-container py-4">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/" className="text-3xl font-bold tracking-tight text-white">
            <span className="text-arena-orange">BGMI</span>Arena
          </NavLink>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-lg font-semibold transition ${isActive ? "text-white" : "text-arena-muted hover:text-white"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 md:block">
                  <div className="text-sm font-semibold text-white">{user?.username}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-arena-muted">{user?.role || "player"}</div>
                </div>
                {user?.role === "admin" ? (
                  <NavLink to="/admin" className="btn-secondary px-4 py-2 text-sm">
                    Admin Panel
                  </NavLink>
                ) : null}
                <button type="button" onClick={logout} className="btn-primary px-4 py-2 text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-secondary px-4 py-2 text-sm">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn-primary px-4 py-2 text-sm">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>

        <nav className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-orange-500/40 bg-orange-500/15 text-white"
                    : "border-white/10 bg-white/5 text-arena-muted hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
