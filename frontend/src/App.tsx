import { useState } from "react";
import LeadForm from "./components/LeadForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [view, setView] = useState<"dashboard" | "form">("dashboard");

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-800">
          AI FollowUp
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-800 ${
              view === "dashboard" ? "bg-gray-800" : ""
            }`}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-800 ${
              view === "form" ? "bg-gray-800" : ""
            }`}
            onClick={() => setView("form")}
          >
            Skicka Lead
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          v0.1 MVP
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
          <h1 className="text-xl font-semibold">{view === "dashboard" ? "Dashboard" : "Skicka Lead"}</h1>
          {/* Här kan vi lägga till search / profil / logout */}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6">
          {view === "dashboard" ? <Dashboard /> : <LeadForm />}
        </div>
      </main>
    </div>
  );
}
