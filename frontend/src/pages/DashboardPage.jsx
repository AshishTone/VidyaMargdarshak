import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Download,
  Map,
  School,
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import {
  fetchColleges,
  fetchDeadlines,
  fetchRecommendedCareers,
  fetchRecommendedCourses,
  fetchRecommendedResources,
  fetchStreamRecommendation,
  fetchAiOverview,
} from "../services/platformService";
import { exportUserReportPdf } from "../utils/pdfExport";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState(null);
  const [aiOverview, setAiOverview] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [careers, setCareers] = useState([]);
  const [resources, setResources] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStreamRecommendation().then(setRecommendation).catch(() => null);
    fetchAiOverview().then(setAiOverview).catch(() => null);
    fetchDeadlines().then((items) => setDeadlines(items.slice(0, 3))).catch(() => null);
    fetchColleges().then((items) => setColleges(items.slice(0, 3))).catch(() => null);
    fetchRecommendedCourses().then(setCourses).catch(() => []);
    fetchRecommendedCareers().then(setCareers).catch(() => []);
    fetchRecommendedResources().then(setResources).catch(() => []);
  }, []);

  const handleExportPdf = () => {
    setExporting(true);
    try {
      exportUserReportPdf({
        user,
        recommendation,
        courses,
        careers,
        resources,
        deadlines,
        aiOverview,
      });
    } finally {
      setTimeout(() => setExporting(false), 1200);
    }
  };

  const topCareer = aiOverview?.topCareer;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 md:p-10 text-white shadow-2xl border border-cyan-500/20">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-cyan-300 border border-cyan-400/30">
                <Brain className="h-3.5 w-3.5 text-cyan-400" />
                VidyaAI Student Career Navigator
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                Class {user?.classLevel || "10th"} Grade
              </span>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-emerald-300">{user?.name || "Student"}</span>!
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-slate-300 font-normal">
              Take your assessment quiz, explore personalized AI career predictions, review degree roadmaps, and download your guidance PDF report.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/assessment">
                <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-xl border-0 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer">
                  <span>Take Assessment Quiz</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </Button>
              </Link>

              <Link to="/results">
                <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-cyan-300" />
                  View AI Predictions
                </Button>
              </Link>

              <Button
                onClick={handleExportPdf}
                disabled={exporting}
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 flex items-center gap-2"
              >
                <Download className="h-4 w-4 text-cyan-300" />
                {exporting ? "Preparing PDF..." : "Export Report"}
              </Button>
            </div>
          </div>

          {/* Current AI & Stream Recommendation Preview Box */}
          <div className="rounded-3xl bg-white/[0.07] p-6 backdrop-blur-md border border-white/15 shadow-xl">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" /> Current Recommendation
            </p>

            <h3 className="mt-3 text-2xl font-black text-white">
              {recommendation?.stream ? `${recommendation.stream} Stream` : "Take Quiz to Unlock Fit"}
            </h3>

            {topCareer && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Top AI Career Match:</span>
                <p className="text-base font-extrabold text-cyan-200 mt-0.5">{topCareer.career} ({topCareer.confidence}% match)</p>
              </div>
            )}

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {recommendation?.explanation?.[0] ||
                "Complete your 5-minute assessment quiz to generate personalized stream fit ratings and CareerBERT model recommendations."}
            </p>
          </div>
        </div>
      </div>

      {/* Student POV 4-Step Quick Action Hub */}
      <div>
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-700" />
          4-Step Student Career Action Hub
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/assessment" className="group">
            <SectionCard className="h-full p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400 group-hover:shadow-xl border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 font-bold group-hover:bg-cyan-600 group-hover:text-white transition">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-cyan-800 transition">1. Take Assessment Quiz</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">Answer guided questions to evaluate your stream affinity.</p>
              <div className="mt-4 text-xs font-bold text-cyan-700 flex items-center gap-1">
                <span>Start 5-min Quiz</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </SectionCard>
          </Link>

          <Link to="/results" className="group">
            <SectionCard className="h-full p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-400 group-hover:shadow-xl border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-blue-800 transition">2. View AI Predictions</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">CareerBERT semantic similarity & 5-vector match matrix.</p>
              <div className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
                <span>Explore Predictions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </SectionCard>
          </Link>

          <Link to="/roadmaps" className="group">
            <SectionCard className="h-full p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-indigo-400 group-hover:shadow-xl border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800 font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-indigo-800 transition">3. Explore Roadmaps</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">Step-by-step academic & entrance exam decision trees.</p>
              <div className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1">
                <span>View Roadmaps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </SectionCard>
          </Link>

          <Link to="/colleges" className="group">
            <SectionCard className="h-full p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-emerald-400 group-hover:shadow-xl border border-slate-200/80">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold group-hover:bg-emerald-600 group-hover:text-white transition">
                <School className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-emerald-800 transition">4. Colleges & Deadlines</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">Discover top universities & upcoming exam cutoff dates.</p>
              <div className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span>Explore Colleges</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </SectionCard>
          </Link>
        </div>
      </div>

      {/* Student Profile Snapshot & Upcoming Exam Deadlines */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard className="p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Student Profile Snapshot</h3>
              <p className="mt-1 text-xs text-slate-500">Your profile preferences shape the AI recommendation engine.</p>
            </div>
            <Link to="/profile" className="text-xs font-extrabold text-blue-700 hover:underline">
              Edit Profile →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Class Level</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">
                Class {user?.classLevel || "10th"} Grade
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Location & Language</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">
                {user?.location?.city || "City Pending"}, {user?.language || "English"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Stated Domain Interests</p>
              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {user?.interests?.length ? user.interests.join(", ") : "Add interests in your profile to refine AI accuracy."}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-black text-slate-900">Upcoming Exam Deadlines</h3>
            </div>
            <Link to="/deadlines" className="text-xs font-extrabold text-blue-700 hover:underline">
              View All →
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {deadlines.length ? (
              deadlines.map((deadline) => (
                <div key={deadline._id || deadline.title} className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{deadline.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(deadline.date).toLocaleDateString()} • {deadline.category || "Exam"}
                    </p>
                  </div>
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No active exam deadlines found right now.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
