import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Sparkles,
  Award,
  BookOpen,
  Compass,
  FileText,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import SectionCard from "../components/ui/SectionCard";
import StreamScoreChart from "../components/charts/StreamScoreChart";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import AiOverviewSection from "../components/ui/AiOverviewSection";
import {
  fetchAiOverview,
  fetchDeadlines,
  fetchRecommendedCareers,
  fetchRecommendedCourses,
  fetchRecommendedResources,
  fetchStreamRecommendation,
} from "../services/platformService";
import { exportUserReportPdf } from "../utils/pdfExport";

export default function ResultsPage() {
  const { user } = useAuth();
  const [state, setState] = useState({
    recommendation: null,
    courses: [],
    careers: [],
    resources: [],
    deadlines: [],
    aiOverview: null,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchStreamRecommendation().catch(() => null),
      fetchRecommendedCourses().catch(() => []),
      fetchRecommendedCareers().catch(() => []),
      fetchRecommendedResources().catch(() => []),
      fetchDeadlines().catch(() => []),
      fetchAiOverview().catch(() => null),
    ])
      .then(([recommendation, courses, careers, resources, deadlines, aiOverview]) => {
        setState({
          recommendation,
          courses: courses || [],
          careers: careers || [],
          resources: resources || [],
          deadlines: deadlines || [],
          aiOverview,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportPdf = () => {
    setExporting(true);
    try {
      exportUserReportPdf({
        user,
        recommendation: state.recommendation,
        courses: state.courses,
        careers: state.careers,
        resources: state.resources,
        deadlines: state.deadlines,
        aiOverview: state.aiOverview,
      });
    } finally {
      setTimeout(() => setExporting(false), 1200);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Evaluating Assessment Diagnostic...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Synthesizing psychometric scores, report card marks, and SentenceTransformer model predictions.
        </p>
      </div>
    );
  }

  if (!state.recommendation) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-slate-900 p-8 text-white text-center shadow-xl border border-slate-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 mb-4 border border-cyan-500/30">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-white">No Assessment Diagnostics Found</h2>
        <p className="mt-2 text-sm text-slate-300">
          Complete your career assessment quiz to unlock your personalized stream recommendations, skill gap analysis, and AI predictions.
        </p>
        <Link to="/assessment" className="mt-6 inline-block">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg border-0">
            Take Assessment Quiz Now
          </Button>
        </Link>
      </div>
    );
  }

  const rec = state.recommendation;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 md:p-10 text-white shadow-2xl border border-cyan-500/20">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-cyan-300 border border-cyan-400/30">
                <Sparkles className="h-3.5 w-3.5" />
                Verified Assessment Diagnostics
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                High Affinity Match
              </span>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">
              Recommended Stream: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-emerald-300">{rec.stream}</span>
            </h1>

            <p className="mt-2.5 text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              Evaluated directly from your completed Assessment Quiz results, academic report card, and stated psychometric interests.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2.5 self-start md:self-auto bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-xl border-0 hover:scale-105 transition-all cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4 text-slate-950 stroke-[3]" />
            <span>{exporting ? "Generating PDF Report..." : "Export Comprehensive PDF Report"}</span>
          </button>
        </div>

        {/* Dynamic Explanations Grid */}
        {rec.explanation && rec.explanation.length > 0 && (
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rec.explanation.map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-white/[0.06] p-4 backdrop-blur-md border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VidyaAI Machine Learning Intelligence Overview Section */}
      {state.aiOverview && (
        <AiOverviewSection
          aiOverview={state.aiOverview}
          onAiUpdate={(updated) => setState((prev) => ({ ...prev, aiOverview: updated }))}
        />
      )}

      {/* Stream Score Breakdown Chart & Alignment Breakdown */}
      {rec.scores && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <SectionCard className="p-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              Assessment Stream Score Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Normalized match score distribution across candidate streams (0 - 100%).
            </p>
            <div className="h-80">
              <StreamScoreChart scores={rec.scores} />
            </div>
          </SectionCard>

          <SectionCard className="p-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              Stream Affinity Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Evaluation of your assessment quiz metrics by stream domain.
            </p>
            <div className="space-y-3">
              {Object.entries(rec.scores).map(([stream, score]) => (
                <div key={stream} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900">{stream} Stream</p>
                    <div className="mt-1 h-2 w-48 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                  <span className="rounded-xl bg-blue-100 px-3 py-1 text-sm font-black text-blue-900">
                    {score}% Match
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Suggested Courses, Career Pathways, & Study Resources */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suggested Courses */}
        <SectionCard className="p-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Recommended Degree Courses
          </h3>
          <div className="mt-4 space-y-3">
            {state.courses.slice(0, 4).map((course) => (
              <div key={course._id || course.name} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="font-bold text-slate-900">{course.name}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Duration: {course.duration || "3 - 4 Years"}</span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-800 font-bold">
                    {course.targetStream || "High Affinity"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Career Paths */}
        <SectionCard className="p-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Target Career Pathways
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.careers.slice(0, 8).map((career, cIdx) => (
              <span
                key={career._id || career.title || cIdx}
                className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 border border-emerald-200/60"
              >
                {career.title || career.career || career}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Study Resources */}
        <SectionCard className="p-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Curated Study Resources
          </h3>
          <div className="mt-4 space-y-3">
            {state.resources.slice(0, 4).map((resource) => (
              <a
                key={resource._id || resource.title}
                href={resource.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-2xl border border-slate-200 p-4 hover:border-cyan-400 hover:bg-cyan-50/40 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 group-hover:text-cyan-900">{resource.title}</p>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-600" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {resource.format || "Resource"} • {resource.language || "English"}
                </p>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
