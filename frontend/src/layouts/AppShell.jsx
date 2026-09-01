import { LogOut, Menu, User2, X, Lock, Sparkles, Brain, Compass, BookOpen, GraduationCap, Clock } from "lucide-react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { sidebarLinks } from "../utils/constants";

export default function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {menuOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      ) : null}

      {/* Mobile & Drawer Navigation */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-[320px] transform border-r border-slate-800 bg-slate-950 p-6 text-white shadow-2xl transition duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3 border-b border-white/10 pb-6">
          <div>
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-12 w-auto" />
            <p className="mt-3 text-xs text-slate-300 leading-relaxed font-normal">
              AI-Powered Student Career Guidance & Academic Stream Navigator.
            </p>
          </div>
          <button
            className="rounded-xl border border-slate-700 p-2 hover:bg-white/10 transition cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <nav className="space-y-1.5">
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
                  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    !isUnlocked
                      ? "opacity-40 cursor-not-allowed text-slate-400"
                      : isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
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

      {/* Main Top Header Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-[94rem] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-2xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition cursor-pointer shadow-sm"
              onClick={() => setMenuOpen(true)}
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5 text-slate-800" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-9 w-auto" />
            </Link>
            <div className="hidden sm:block pl-2 border-l border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
                Student Account
              </p>
              <h2 className="text-sm font-black text-slate-900 leading-none mt-0.5">{user?.name || "Student"}</h2>
            </div>
          </div>

          {/* Quick-Access Top Navigation Pills for Student POV Ease */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/assessment"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <Sparkles className="h-3 w-3 text-cyan-600" /> Assessment Quiz
            </NavLink>
            <NavLink
              to="/results"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <Brain className="h-3 w-3 text-cyan-600" /> AI Predictions
            </NavLink>
            <NavLink
              to="/roadmaps"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <Compass className="h-3 w-3 text-blue-600" /> Roadmaps
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <BookOpen className="h-3 w-3 text-indigo-600" /> Courses
            </NavLink>
            <NavLink
              to="/colleges"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${
                  isActive ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <GraduationCap className="h-3 w-3 text-emerald-600" /> Colleges
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <User2 className="h-3.5 w-3.5 text-blue-800" />
              <span>
                Class {user?.classLevel || "10th"} • {user?.language || "English"}
              </span>
            </div>
            <Button variant="secondary" className="gap-2 text-xs font-extrabold rounded-2xl px-4 py-2" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[94rem] px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
