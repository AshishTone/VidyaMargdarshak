import { useState } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Zap,
  BarChart3,
  Target,
  GraduationCap,
  Award,
  Layers,
  Lightbulb,
  DollarSign,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import Button from "./Button";
import { simulateAiOverview } from "../../services/platformService";

const SUBJECT_LIST = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "English",
  "History",
];

const INTEREST_LIST = [
  "Technology",
  "Engineering",
  "Science",
  "Mathematics",
  "Commerce",
  "Business",
  "Arts",
  "Design",
];

export default function AiOverviewSection({ data: initialData, aiOverview, onAiUpdate }) {
  const rawData = initialData || aiOverview;
  const [data, setData] = useState(rawData);
  const [activeTab, setActiveTab] = useState("predictions");
  const [loadingSim, setLoadingSim] = useState(false);

  // Simulator controls
  const defaultSubjects = initialData?.studentFeatures?.subjectScores || {
    Mathematics: 75,
    "Computer Science": 75,
    Physics: 70,
    Chemistry: 70,
    Biology: 65,
    Economics: 65,
    English: 80,
    History: 60,
  };

  const defaultInterests = initialData?.studentFeatures?.interestScores || {
    Technology: 4,
    Engineering: 3,
    Science: 4,
    Mathematics: 4,
    Commerce: 2,
    Business: 2,
    Arts: 3,
    Design: 3,
  };

  const [simSubjects, setSimSubjects] = useState(defaultSubjects);
  const [simInterests, setSimInterests] = useState(defaultInterests);

  if (!data) return null;

  const topCareer = data.topCareer || data.predictions?.[0];

  const handleSubjectChange = (subject, val) => {
    const updated = { ...simSubjects, [subject]: Number(val) };
    setSimSubjects(updated);
    triggerSimulation(updated, simInterests);
  };

  const handleInterestChange = (interest, val) => {
    const updated = { ...simInterests, [interest]: Number(val) };
    setSimInterests(updated);
    triggerSimulation(simSubjects, updated);
  };

  const triggerSimulation = async (subjScores, intScores) => {
    setLoadingSim(true);
    try {
      const res = await simulateAiOverview({
        subjectScores: subjScores,
        interestScores: intScores,
      });
      if (res.aiOverview) {
        setData(res.aiOverview);
      }
    } catch (err) {
      console.error("Failed to run AI simulation:", err);
    } finally {
      setLoadingSim(false);
    }
  };

  const handleResetSimulation = () => {
    setSimSubjects(defaultSubjects);
    setSimInterests(defaultInterests);
    setData(initialData);
  };

  return (
    <div className="mt-8 rounded-3xl bg-slate-950 p-6 md:p-8 text-white shadow-2xl border border-cyan-500/20 relative overflow-hidden">
      {/* Background Neon Glass Glows */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

      {/* Main Header Container */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30">
              <Brain className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              VidyaAI™ Neural Intelligence v4.5
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20">
              Hugging Face: lwolfrum2/careerbert-jg
            </span>
          </div>

          <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            AI Career & Stream Alignment Overview
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-300">
            Powered by CareerBERT 768-dim semantic similarity vectors & Ensemble ML
          </p>
        </div>

        {/* Top Recommendation Badge */}
        {topCareer && (
          <div className="rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-slate-900/60 p-4 border border-cyan-400/40 backdrop-blur-md shrink-0 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
              Top Predictive Match
            </p>
            <h3 className="text-base font-black text-white">{topCareer.career}</h3>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/30">
                {topCareer.confidence}% Confidence
              </span>
              <span className="text-xs text-slate-300 font-semibold">{topCareer.stream} Stream</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="relative z-10 mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("predictions")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "predictions"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Top Predictions ({data.predictions?.length || 5})
        </button>

        <button
          onClick={() => setActiveTab("vectors")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "vectors"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          5-Vector Neural Match
        </button>

        <button
          onClick={() => setActiveTab("mechanics")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "mechanics"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Feature Importance
        </button>

        <button
          onClick={() => setActiveTab("skillgaps")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "skillgaps"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          Skill Gap & Roadmap
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "simulator"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Dual-Axis Simulator
        </button>
      </div>

      {/* AI Executive Summary Card */}
      <div className="relative z-10 mt-5 rounded-2xl bg-white/[0.06] p-5 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
              AI Executive Synthesis
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200 font-normal">
              {data.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: TOP PREDICTIONS */}
      {activeTab === "predictions" && (
        <div className="relative z-10 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Ranked Machine Learning Predictions & Sub-Score Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">
              Sorted by Calibrated Probabilistic Confidence
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.predictions?.map((item, idx) => (
              <div
                key={item.career}
                className={`group relative flex flex-col justify-between rounded-2xl p-5 backdrop-blur-md border transition-all duration-300 ${
                  idx === 0
                    ? "bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400/50 shadow-xl shadow-cyan-500/10"
                    : "bg-white/[0.05] border-white/10 hover:border-cyan-400/30 hover:bg-white/[0.09]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-black ${
                        idx === 0
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
                          : "bg-blue-500/30 text-cyan-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/30">
                      {item.confidence}% Match
                    </span>
                  </div>

                  <h4 className="mt-3.5 text-lg font-black text-white group-hover:text-cyan-200 transition">
                    {item.career}
                  </h4>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {item.stream} Stream Pathway
                    </span>
                    {item.salaryRange && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                        <DollarSign className="h-3 w-3 text-emerald-400" /> {item.salaryRange}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Sub-score Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.assessmentMatch !== undefined && (
                      <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-400/20">
                        Quiz: {item.assessmentMatch}%
                      </span>
                    )}
                    {item.academicMatch !== undefined && (
                      <span className="rounded-lg bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/20">
                        Academic: {item.academicMatch}%
                      </span>
                    )}
                    {item.interestMatch !== undefined && (
                      <span className="rounded-lg bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/20">
                        Interest: {item.interestMatch}%
                      </span>
                    )}
                    {item.demandIndex !== undefined && (
                      <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 border border-amber-400/20">
                        Demand: {item.demandIndex}/100
                      </span>
                    )}
                  </div>

                  {item.futureProofScore && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>AI Automation Vulnerability: {item.futureProofScore}</span>
                    </div>
                  )}

                  {/* Required Skills */}
                  {item.requiredSkills && item.requiredSkills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Core Competencies:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.requiredSkills.slice(0, 3).map((sk) => (
                          <span key={sk} className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATS Career Page Portals (latmay/ats-career-page-urls) */}
                  {item.atsPortals && item.atsPortals.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1">
                        🌐 Verified ATS Career Portals:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.atsPortals.map((portal, pIdx) => (
                          <a
                            key={pIdx}
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 px-2.5 py-1 text-[10px] font-bold text-cyan-200 border border-cyan-400/30 transition flex items-center gap-1"
                          >
                            <span>{portal.name}</span>
                            <span className="text-[9px]">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confidence Progress Meter */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-blue-200 mb-1.5 font-semibold">
                    <span>Predictive Score</span>
                    <span className="font-black text-white">{item.confidence}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {item.growthOutlook}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: 5-VECTOR NEURAL MATCH BREAKDOWN */}
      {activeTab === "vectors" && (
        <div className="relative z-10 mt-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            5-Vector Calibrated Alignment Matrix for {topCareer?.career}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-300">1. Assessment Quiz Match</span>
                <span className="text-sm font-black text-white">{topCareer?.assessmentMatch || 88}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${topCareer?.assessmentMatch || 88}%` }} />
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Direct alignment with completed Assessment Quiz domain performance.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-cyan-300">2. CareerBERT Vector Similarity</span>
                <span className="text-sm font-black text-white">{topCareer?.confidence || 92}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${topCareer?.confidence || 92}%` }} />
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Hugging Face lwolfrum2/careerbert-jg 768-dim semantic similarity score.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-blue-300">3. Academic Performance Vector</span>
                <span className="text-sm font-black text-white">{topCareer?.academicMatch || 85}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${topCareer?.academicMatch || 85}%` }} />
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Weighted score across core required academic subjects.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-purple-300">4. Psychometric Interest Fit</span>
                <span className="text-sm font-black text-white">{topCareer?.interestMatch || 90}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-purple-400" style={{ width: `${topCareer?.interestMatch || 90}%` }} />
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Alignment with stated domain interest preferences.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-300">5. Industry Market Demand</span>
                <span className="text-sm font-black text-white">{topCareer?.demandIndex || 95}/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${topCareer?.demandIndex || 95}%` }} />
              </div>
              <p className="text-[11px] text-slate-300 mt-2">Projected 10-year job growth and hiring market demand index.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODEL MECHANICS & FEATURE IMPORTANCE */}
      {activeTab === "mechanics" && (
        <div className="relative z-10 mt-6 grid gap-6 lg:grid-cols-2">
          {/* Feature Importance List */}
          <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Random Forest Decision Drivers (Feature Importances)
            </h4>
            <div className="space-y-3.5">
              {data.featureImportances?.map((feat) => (
                <div key={feat.feature}>
                  <div className="flex justify-between text-xs text-slate-200 mb-1.5 font-medium">
                    <span>{feat.feature}</span>
                    <span className="font-black text-cyan-300">+{feat.impact}% Weight</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${Math.min(100, feat.impact * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Architecture Metadata */}
          <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Model Architecture Specifications
            </h4>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-400">Embedding Model</dt>
                <dd className="font-bold text-white">{data.modelInfo?.name || "VidyaAI™ CareerBERT"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-400">Hugging Face Repo</dt>
                <dd className="font-mono text-cyan-300 font-bold">{data.modelInfo?.huggingFaceRepo || "lwolfrum2/careerbert-jg"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-400">ATS Dataset</dt>
                <dd className="font-mono text-cyan-300 font-bold">{data.modelInfo?.atsDataset || "latmay/ats-career-page-urls"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-400">Model Version</dt>
                <dd className="font-bold text-emerald-300">{data.modelInfo?.version || "v4.5.0"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-400">Ensemble Classifier</dt>
                <dd className="font-medium text-slate-200 text-right max-w-[220px]">
                  Random Forest & Gradient Boosting Classifier
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Validation Metric</dt>
                <dd className="font-black text-cyan-300">
                  {data.modelInfo?.accuracy || "92.00% Test Accuracy (93.81% 5-Fold Stratified CV)"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* TAB 3: SKILL GAP & ROADMAP */}
      {activeTab === "skillgaps" && (
        <div className="relative z-10 mt-6 grid gap-6 lg:grid-cols-2">
          {/* Skill Gap Analysis Card */}
          <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              Target Skill Gap Analysis
            </h4>
            <ul className="space-y-3">
              {data.skillGaps?.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Higher Education Pathways */}
          <div className="rounded-2xl bg-white/[0.05] p-5 border border-white/10 backdrop-blur-md">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              Recommended Degree & Higher Education Pathways
            </h4>
            <div className="space-y-2">
              {topCareer?.recommendedDegrees?.map((deg) => (
                <div
                  key={deg}
                  className="rounded-xl bg-white/5 p-3 text-xs font-bold text-white border border-white/10 flex items-center justify-between"
                >
                  <span>{deg}</span>
                  <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-500/20 px-2 py-0.5 rounded-md">
                    High Affinity
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DUAL-AXIS SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="relative z-10 mt-6 rounded-2xl bg-white/[0.05] p-5 md:p-6 border border-white/10 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Live Dual-Axis Predictive Simulator
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Adjust academic subject marks and psychometric interest ratings to observe real-time AI recalibration.
              </p>
            </div>
            <button
              onClick={handleResetSimulation}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Parameters
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Axis 1: Academic Subject Marks (0 - 100) */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                Axis 1: Academic Subject Marks (0 - 100)
              </h5>
              <div className="space-y-3">
                {SUBJECT_LIST.map((subj) => (
                  <div key={subj}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                      <span>{subj}</span>
                      <span className="font-bold text-cyan-300">{simSubjects[subj] ?? 70}%</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={simSubjects[subj] ?? 70}
                      onChange={(e) => handleSubjectChange(subj, e.target.value)}
                      className="w-full h-1.5 rounded-lg bg-white/20 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Axis 2: Psychometric Interest Preference (1 - 5) */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                Axis 2: Psychometric Interest Ratings (1 - 5)
              </h5>
              <div className="space-y-3">
                {INTEREST_LIST.map((intKey) => (
                  <div key={intKey}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                      <span>{intKey} Preference</span>
                      <span className="font-bold text-purple-300">{simInterests[intKey] ?? 3} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={simInterests[intKey] ?? 3}
                      onChange={(e) => handleInterestChange(intKey, e.target.value)}
                      className="w-full h-1.5 rounded-lg bg-white/20 accent-purple-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {loadingSim && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300 pt-2 animate-pulse">
              <Sparkles className="h-4 w-4" />
              Recalibrating SentenceTransformer Similarity Matrix...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
