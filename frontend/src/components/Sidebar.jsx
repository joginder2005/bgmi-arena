import { Link } from "react-router-dom";

const adminSections = [
  { label: "Dashboard", key: "dashboard-stats" },
  { label: "Create Match", key: "create-match" },
  { label: "Manage Matches", key: "manage-matches" },
];

function Sidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="arena-card h-fit p-5 lg:sticky lg:top-6">
      <Link to="/" className="mb-6 block text-2xl font-bold text-white transition hover:text-arena-orange">
        <span className="text-arena-orange">BGMI</span> Admin
      </Link>
      <nav className="space-y-2">
        {adminSections.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange(item.key)}
            className={`flex w-full items-center rounded-2xl px-4 py-3 text-left text-lg font-semibold transition ${
              activeSection === item.key
                ? "bg-orange-500/15 text-white shadow-glow"
                : "text-arena-muted hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
