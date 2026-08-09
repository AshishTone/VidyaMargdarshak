import { LogOut, Menu, User2, X, Lock } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { sidebarLinks } from "../utils/constants";

export default function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {menuOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-[300px] transform border-r border-slate-800 bg-slate-950 p-6 text-white shadow-2xl transition ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-14 w-auto" />
            <p className="mt-4 text-sm text-slate-300">
              Student guidance platform for assessments, roadmaps, courses, and colleges.
            </p>
          </div>
          <button className="rounded-xl border border-slate-700 p-2" onClick={() => setMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isProfile = link.to === "/profile";
            const isUnlocked = user?.profileCompleted || isProfile;

            return (
              <NavLink
                key={link.to}
                to={isUnlocked ? link.to : "#"}
                onClick={(e) => {
                  if (!isUnlocked) {
                    e.preventDefault();
                  } else {
                    setMenuOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                    !isUnlocked
                      ? "opacity-40 cursor-not-allowed text-slate-400"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <span>{link.label}</span>
                {!isUnlocked && <Lock className="h-4 w-4 text-slate-500" />}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-10 w-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">
                Welcome back
              </p>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 sm:flex">
              <User2 className="h-4 w-4 text-blue-800" />
              <span className="text-sm text-slate-700">
                {user?.classLevel}th / {user?.language}
              </span>
            </div>
            <Button variant="secondary" className="gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5">
        <Outlet />
      </main>
    </div>
  );
}
