import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ClipboardList, Map, School, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import {
  fetchColleges,
  fetchDeadlines,
  fetchStreamRecommendation,
} from "../services/platformService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetchStreamRecommendation().then(setRecommendation).catch(() => null);
    fetchDeadlines().then((items) => setDeadlines(items.slice(0, 3))).catch(() => null);
    fetchColleges().then((items) => setColleges(items.slice(0, 3))).catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard className="overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#60a5fa_100%)] text-white">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Student Dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Build confidence around your next academic move.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              Complete your profile, take the assessment, and compare course and college options
              with source-backed information.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/assessment">
                <Button className="gap-2">
                  Start assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/roadmaps">
                <Button variant="ghost" className="bg-blue-500/20 text-white hover:bg-blue-500/30">
                  Explore roadmaps
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">
                  Explore courses
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-semibold text-blue-100">Current recommendation</p>
            <p className="mt-3 text-3xl font-bold">
              {recommendation?.stream || "Take the assessment to unlock your stream fit"}
            </p>
            <p className="mt-3 text-sm text-blue-100">
              {recommendation?.explanation?.[0] ||
                "We combine your assessment answers with interests and profile details for explainable guidance."}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Assessment", copy: "Answer guided questions", icon: ClipboardList, link: "/assessment" },
          { title: "Courses", copy: "Explore study paths", icon: BookOpen, link: "/courses" },
          { title: "Roadmaps", copy: "View public and personalized graphs", icon: Map, link: "/roadmaps" },
        ].map((item) => (
          <Link key={item.title} to={item.link}>
            <SectionCard className="h-full transition hover:-translate-y-1">
              <item.icon className="h-10 w-10 rounded-2xl bg-blue-100 p-2 text-blue-900" />
              <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
            </SectionCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-title">Profile Snapshot</p>
              <p className="mt-2 text-sm text-slate-600">These details directly shape the recommendation engine.</p>
            </div>
            <Link to="/profile" className="text-sm font-semibold text-blue-800">
              Edit profile
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Class Level</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                Class {user?.classLevel}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location & language</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {user?.location?.city || "City pending"}, {user?.language}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interests</p>
              <p className="mt-2 text-sm text-slate-700">
                {user?.interests?.length ? user.interests.join(", ") : "Add interests to refine recommendations."}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[var(--vm-accent)]" />
            <p className="section-title">Upcoming Deadlines</p>
          </div>

          <div className="mt-6 space-y-4">
            {deadlines.length ? (
              deadlines.map((deadline) => (
                <div key={deadline._id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{deadline.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(deadline.date).toLocaleDateString()} • {deadline.category}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Deadlines will appear here once data is available.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex items-center gap-3">
          <School className="h-5 w-5 text-blue-800" />
          <p className="section-title">Featured Colleges</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Live college cards from the current database, replacing placeholder dashboard content.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {colleges.map((college) => (
            <div key={college._id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <p className="text-lg font-bold text-slate-950 leading-tight">{college.name}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                    {college.verifiedStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {college.location.city}, {college.location.state}
                </p>
                
                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="font-semibold text-slate-900 block">Courses:</span>
                    <span className="text-slate-600 block truncate">
                      {college.coursesOffered?.slice(0, 2).map((course) => course.name).join(", ") || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Facilities:</span>
                    <span className="text-slate-600 block truncate">{college.facilities?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span className="font-semibold text-slate-900 block">Fees:</span>
                      <span className="text-slate-600 block truncate">{college.feesRange || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">Languages:</span>
                      <span className="text-slate-600 block truncate">{college.mediumOfInstruction?.join(", ") || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Source: {college.source?.label || "Institutional Registry"}</span>
                {college.contact?.website ? (
                  <a
                    href={college.contact.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-800 font-semibold hover:underline"
                  >
                    Visit
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
