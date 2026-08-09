import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Sparkles } from "lucide-react";
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchStreamRecommendation(),
      fetchRecommendedCourses(),
      fetchRecommendedCareers(),
      fetchRecommendedResources(),
      fetchDeadlines().catch(() => []),
      fetchAiOverview().catch(() => null),
    ])
      .then(([recommendation, courses, careers, resources, deadlines, aiOverview]) =>
        setState({
          recommendation,
          courses,
          careers,
          resources,
          deadlines: deadlines || [],
          aiOverview,
        })
      )
      .catch(() => null);
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
      setTimeout(() => setExporting(false), 1000);
    }
  };

  if (!state.recommendation) {
    return (
      <SectionCard>
        <p className="section-title">No results yet</p>
        <p className="mt-2 text-sm text-slate-600">Complete the assessment first to unlock recommendations.</p>
        <Link to="/assessment" className="mt-4 inline-flex">
          <Button>Take the assessment</Button>
        </Link>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white p-8 rounded-[2rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200 border border-blue-400/30">
                <Sparkles className="h-3.5 w-3.5" />
                Assessment Results
              </span>
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
              Recommended Stream: {state.recommendation.stream}
            </h1>
            <p className="mt-2 text-sm text-blue-200 max-w-2xl">
              Personalized evaluation generated from your aptitude responses, key strengths, and academic preferences.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting}
            variant="secondary"
            className="flex items-center gap-2 self-start md:self-auto bg-white text-blue-950 hover:bg-slate-100 font-bold px-5 py-3 rounded-2xl shadow-md border-0 hover:scale-105 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-900" />
            <span className="text-blue-950 font-bold">{exporting ? "Preparing PDF..." : "Export Report (PDF)"}</span>
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.recommendation.explanation.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-medium leading-relaxed text-blue-100">{item}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* VidyaAI Machine Learning Overview Feature */}
      {state.aiOverview && (
        <AiOverviewSection
          aiOverview={state.aiOverview}
          onAiUpdate={(updated) => setState((prev) => ({ ...prev, aiOverview: updated }))}
        />
      )}



      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SectionCard>
          <p className="section-title">Score Breakdown</p>
          <div className="mt-6 h-80">
            <StreamScoreChart scores={state.recommendation.scores} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Why this fits</p>
          <div className="mt-5 space-y-3">
            {Object.entries(state.recommendation.scores).map(([stream, score]) => (
              <div key={stream} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{stream}</p>
                  <p className="text-sm font-semibold text-blue-800">{score}/100</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard>
          <p className="section-title">Suggested Courses</p>
          <div className="mt-4 space-y-3">
            {state.courses.slice(0, 4).map((course) => (
              <div key={course._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{course.name}</p>
                <p className="mt-1 text-sm text-slate-600">{course.duration}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Career Paths</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.careers.slice(0, 8).map((career) => (
              <span key={career.title} className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900">
                {career.title}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Study Resources</p>
          <div className="mt-4 space-y-3">
            {state.resources.map((resource) => (
              <a
                key={resource._id}
                href={resource.link}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{resource.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {resource.format} • {resource.language}
                </p>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
