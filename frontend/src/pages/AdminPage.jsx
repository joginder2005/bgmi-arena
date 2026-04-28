import { useState } from "react";
import AdminPanel from "../components/AdminPanel";
import Sidebar from "../components/Sidebar";

function AdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard-stats");

  return (
    <section className="arena-container py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <AdminPanel activeSection={activeSection} />
      </div>
    </section>
  );
}

export default AdminPage;
