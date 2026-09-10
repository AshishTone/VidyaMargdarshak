import { LogOut, Menu, User2, X, Lock, ArrowLeft } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { sidebarLinks } from "../utils/constants";

// Links to display in the center of the navigation bar
const centerNavLinks = [
  { to: "/profile", label: "Profile" },
  { to: "/assessment", label: "Assessments" },
  { to: "/results", label: "Results" },
  { to: "/roadmaps", label: "Roadmaps" },
  { to: "/colleges", label: "Colleges" },
  { to: "/deadlines", label: "Deadlines" },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Drawer Overlay */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      {/* Hamburger Drawer Menu (retained for full navigation) */}
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
          <button
            className="rounded-xl border border-slate-700 p-2 cursor-pointer hover:bg-slate-800"
            onClick={() => setMenuOpen(false)}
          >
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
                      ? "bg-blue-600 text-white font-semibold"
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

      {/* Top Header with Centered Nav Links Inspired by Design Mockup */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 py-3.5 sm:px-6">
          {/* Left: Hamburger Icon & Brand */}
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              onClick={() => setMenuOpen(true)}
              title="Open full menu"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-9 w-auto" />
              <span className="font-bold text-slate-900 text-lg tracking-tight hidden sm:inline">
                VidyaMargdarshak
              </span>
            </Link>
          </div>

          {/* Center: Horizontal Navigation Links (Interactive & theme-blended) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-xs backdrop-blur-xs">
            {centerNavLinks.map((link) => {
              const isUnlocked = user?.profileCompleted || link.to === "/profile";
              return (
                <NavLink
                  key={link.to}
                  to={isUnlocked ? link.to : "#"}
                  onClick={(e) => {
                    if (!isUnlocked) {
                      e.preventDefault();
                    }
                  }}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      !isUnlocked
                        ? "opacity-40 cursor-not-allowed text-slate-400"
                        : isActive
                        ? "bg-white text-blue-700 shadow-xs font-bold scale-[1.02]"
                        : "text-slate-600 hover:text-blue-700 hover:bg-white/80 active:scale-95"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {location.pathname !== "/dashboard" ? (
              <Button
                variant="secondary"
                className="gap-1.5 py-1.5 px-3 text-xs sm:text-sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : null}
            {user?.profileCompleted ? (
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <User2 className="h-3.5 w-3.5 text-blue-700" />
                <span>Class {user.classLevel === "10" ? "10th" : "12th"}</span>
              </div>
            ) : null}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5">
        <Outlet />
      </main>
    </div>
  );
}
