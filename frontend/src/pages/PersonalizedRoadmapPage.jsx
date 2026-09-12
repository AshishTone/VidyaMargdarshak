import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import MermaidViewer from "../components/roadmap/MermaidViewer";
import { fetchPersonalizedRoadmap } from "../services/platformService";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function PersonalizedRoadmapPage() {
  const navigate = useNavigate();
  const [personalizedData, setPersonalizedData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch the LLM-generated personalized Mermaid roadmap (cached in MongoDB)
  useEffect(() => {
    fetchPersonalizedRoadmap()
      .then((data) => {
        if (!data || !data.mermaidChart) {
          navigate("/assessment", { replace: true });
          return;
        }
        setPersonalizedData(data);
      })
      .catch((err) => {
        // Redirect directly to assessment if assessment not yet completed
        navigate("/assessment", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <SectionCard className="py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 animate-pulse shadow-md">
          <Compass className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
          Designing Your Personalized Roadmap...
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Synthesizing your assessment interests and academic profile into a custom Mermaid flowchart.
        </p>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard className="py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Compass className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Personalized Roadmap
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {error}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/assessment">
            <Button>Take Assessment</Button>
          </Link>
          <Link to="/roadmaps">
            <Button variant="secondary">Explore Master Roadmaps</Button>
          </Link>
        </div>
      </SectionCard>
    );
  }

  const topCourses =
    personalizedData?.topCourses?.length > 0
      ? personalizedData.topCourses
      : personalizedData?.topInterests || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <SectionCard className="border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
            <Compass className="h-3.5 w-3.5 text-indigo-200" />
            Personalized AI Flowchart
          </div>

          <h1 className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            {personalizedData?.title ||
              `Personalized Career Pathway for ${personalizedData?.studentInfo?.name || "You"}`}
          </h1>

          <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-blue-100/90">
            {personalizedData?.summary ||
              "Generated from your verified assessment results and stored securely in your profile."}
          </p>

          {/* Top Recommended Courses Pills */}
          {topCourses.length > 0 && (
            <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-200 w-full sm:w-auto">
                Top Recommended Courses (India):
              </span>
              {topCourses.map((course, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-white backdrop-blur shadow-sm"
                >
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                  <span>{course}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Main Flowchart Area: Rendered with Interactive Mermaid */}
      <div className="space-y-4">
        {personalizedData?.mermaidChart ? (
          <MermaidViewer
            chart={personalizedData.mermaidChart}
            title={personalizedData.title || "Personalized Roadmap"}
          />
        ) : (
          <SectionCard className="py-12 text-center text-slate-500">
            No flowchart data available. Please re-take your assessment.
          </SectionCard>
        )}
      </div>

      {/* Structured Guidance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard className="border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Academic Gateway</h3>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Focus on foundational subjects and qualifying exams recommended in your flowchart to secure admission into premier undergraduate degrees.
          </p>
        </SectionCard>

        <SectionCard className="border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Higher Specialization</h3>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Postgraduate degrees and technical certifications elevate your career into senior leadership, high-paying specialist roles, and research.
          </p>
        </SectionCard>

        <SectionCard className="border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Civil & Public Sector</h3>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Your graduation degrees also qualify you for top national competitive opportunities such as UPSC Civil Services, PSUs, and defense leadership.
          </p>
        </SectionCard>
      </div>

      {/* Footer Navigation */}
      {/* Footer Navigation */}
      <SectionCard className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs text-slate-500 leading-relaxed text-center sm:text-left">
          This personalized roadmap is generated from your read-only assessment results and stored in MongoDB.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 shrink-0">
          <Link to="/results" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto py-2.5 px-4 text-xs sm:text-sm">View Full Assessment Report</Button>
          </Link>
          <Link to="/roadmaps" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto py-2.5 px-4 text-xs sm:text-sm font-bold shadow-sm">Explore Full Master Graphs</Button>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
