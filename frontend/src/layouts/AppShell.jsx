import {
  LogOut,
  Menu,
  User2,
  X,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Map,
  School,
  Clock,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { sidebarLinks } from "../utils/constants";

// Links to display in the center of the navigation bar with progressive right-to-left reduction
const centerNavLinks = [
  { to: "/dashboard", label: "Dashboard", responsiveClass: "inline-flex" },
  { to: "/profile", label: "Profile", responsiveClass: "inline-flex" },
  { to: "/assessment", label: "Assessments", responsiveClass: "inline-flex" },
  { to: "/results", label: "Results", responsiveClass: "hidden min-[800px]:inline-flex" },
  { to: "/roadmaps", label: "Roadmaps", responsiveClass: "hidden min-[880px]:inline-flex" },
  { to: "/colleges", label: "Colleges", responsiveClass: "hidden min-[960px]:inline-flex" },
  { to: "/deadlines", label: "Deadlines", responsiveClass: "hidden min-[960px]:inline-flex" },
];

// Quick bottom navigation items for mobile
const mobileBottomLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment", label: "Assess", icon: ClipboardList },
  { to: "/roadmaps", label: "Roadmaps", icon: Map },
  { to: "/colleges", label: "Colleges", icon: School },
  { to: "/deadlines", label: "Deadlines", icon: Clock },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Drawer Overlay */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      {/* Hamburger Drawer Menu (retained for full navigation) */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] sm:w-[300px] max-w-[85vw] transform border-r border-slate-800 bg-slate-950 p-5 sm:p-6 text-white shadow-2xl transition duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-11 sm:h-14 w-auto" />
            <p className="mt-3 text-xs sm:text-sm text-slate-300">
              Student guidance platform for assessments, roadmaps, courses, and colleges.
            </p>
          </div>
          <button
            className="rounded-xl border border-slate-700 p-2 cursor-pointer hover:bg-slate-800 shrink-0"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
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
                  `flex items-center justify-between rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm transition ${
                    !isUnlocked
                      ? "opacity-40 cursor-not-allowed text-slate-400"
                      : isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
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

      {/* Top Header with Centered Nav Links */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5">
          {/* Left: Hamburger Icon & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              onClick={() => setMenuOpen(true)}
              title="Open full menu"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5">
              <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-8 sm:h-9 w-auto" />
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight hidden min-[460px]:inline">
                VidyaMargdarshak
              </span>
            </Link>
          </div>

          {/* Center: Horizontal Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 min-[1150px]:gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-xs backdrop-blur-xs">
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
                    `${link.responsiveClass || "inline-flex"} items-center px-2.5 min-[1150px]:px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer ${
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {location.pathname !== "/dashboard" ? (
              <Button
                variant="secondary"
                className="gap-1 py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm"
                onClick={() => navigate(-1)}
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden min-[380px]:inline">Back</span>
              </Button>
            ) : null}

            {user?.profileCompleted ? (
              <div className="hidden min-[640px]:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                <User2 className="h-3.5 w-3.5 text-blue-700" />
                <span>Class {user.classLevel === "10" ? "10th" : "12th"}</span>
              </div>
            ) : null}

            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden min-[380px]:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body: safe bottom padding for mobile bar & chatbot */}
      <main className="mx-auto max-w-[92rem] w-full px-3 py-4 sm:px-5 sm:py-6 pb-24 md:pb-8 flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {mobileBottomLinks.map((item) => {
          const Icon = item.icon;
          const isUnlocked = user?.profileCompleted || item.to === "/dashboard";
          return (
            <NavLink
              key={item.to}
              to={isUnlocked ? item.to : "#"}
              onClick={(e) => {
                if (!isUnlocked) e.preventDefault();
              }}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-[10px] font-semibold transition-all ${
                  !isUnlocked
                    ? "opacity-35 cursor-not-allowed text-slate-400"
                    : isActive
                    ? "text-blue-700 font-bold scale-105"
                    : "text-slate-500 hover:text-slate-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      isActive ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="mt-0.5 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

