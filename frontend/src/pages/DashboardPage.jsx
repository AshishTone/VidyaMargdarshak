import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ClipboardList, Map } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchStreamRecommendation } from "../services/platformService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchStreamRecommendation().then(setRecommendation).catch(() => null);
  }, []);

  const hasAssessment = user?.classLevel === "10" || user?.classLevel === "12";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Welcome Card */}
      <SectionCard className="overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#60a5fa_100%)] text-white shadow-xl">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-blue-100">
              Student Dashboard
            </p>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Build confidence around your next academic move.
            </h1>
            {!user?.profileCompleted ? (
              <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-6 sm:leading-7 text-blue-100">
                Complete your profile to unlock guidance tailored to your education level.
              </p>
            ) : null}
            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <Link to={hasAssessment ? "/assessment" : "/courses"} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold shadow-sm">
                  {hasAssessment ? `Start After-${user?.classLevel}th assessment` : "Explore courses"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/roadmaps" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 py-2.5 px-4 text-xs sm:text-sm">
                  Explore roadmaps
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-[1.8rem] border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur">
            <p className="text-xs sm:text-sm font-semibold text-blue-100 uppercase tracking-wider">
              Current recommendation
            </p>
            <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold leading-tight">
              {recommendation?.stream ||
                (hasAssessment
                  ? "Complete your assessment to unlock your report"
                  : "Explore suitable courses")}
            </p>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {recommendation?.explanation?.[0] ||
                "Your profile helps organize appropriate educational options."}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Main Feature Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {[
          {
            title: "Assessment",
            copy: `Answer the After-${user?.classLevel}th assessment`,
            icon: ClipboardList,
            link: hasAssessment ? "/assessment" : "/courses",
          },
          {
            title: "Courses",
            copy: "Explore study paths and degrees",
            icon: BookOpen,
            link: "/courses",
          },
          {
            title: "Roadmaps",
            copy: "View interactive educational pathways",
            icon: Map,
            link: "/roadmaps",
          },
        ].map((item) => (
          <Link key={item.title} to={item.link}>
            <SectionCard className="h-full transition hover:-translate-y-1 hover:shadow-md cursor-pointer">
              <item.icon className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-blue-100 p-2 text-blue-900" />
              <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{item.copy}</p>
            </SectionCard>
          </Link>
        ))}
      </div>

      {/* Profile Snapshot */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="section-title">Profile Snapshot</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Your board, marks and location support future pathway eligibility checks.
            </p>
          </div>
          <Link to="/profile" className="text-xs sm:text-sm font-bold text-blue-800 hover:underline">
            Edit profile →
          </Link>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Class Level</p>
            <p className="mt-1.5 sm:mt-2 text-base sm:text-lg font-bold text-slate-900">Class {user?.classLevel || "Pending"}</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Location & Language</p>
            <p className="mt-1.5 sm:mt-2 text-base sm:text-lg font-bold text-slate-900 truncate">
              {user?.location?.district || "District pending"}, {user?.language || "English"}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
