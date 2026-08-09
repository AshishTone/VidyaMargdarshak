import { useState } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Cpu,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  BarChart3,
} from "lucide-react";
import SectionCard from "./SectionCard";
import Button from "./Button";
import { simulateAiOverview } from "../../services/platformService";

const SUBJECT_LIST = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Economics",
  "History",
];

export default function AiOverviewSection({ aiOverview: initialData, onAiUpdate }) {
  const [data, setData] = useState(initialData);
  const [showSimulator, setShowSimulator] = useState(false);
  const [customScores, setCustomScores] = useState(initialData?.subjectScores || {});
  const [simulating, setSimulating] = useState(false);

  if (!data) return null;

  const handleScoreChange = (subject, value) => {
    setCustomScores((prev) => ({
      ...prev,
      [subject]: Number(value),
    }));
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const updated = await simulateAiOverview({ subjectScores: customScores });
      setData(updated);
      if (onAiUpdate) onAiUpdate(updated);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetScores = async () => {
    setCustomScores(initialData?.subjectScores || {});
    setData(initialData);
    if (onAiUpdate) onAiUpdate(initialData);
  };

  return (
    <div className="space-y-6">
      {/* Main AI Overview Card */}
      <div className="relative overflow-hidden rounded-[2.2rem] border border-blue-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-7 text-white shadow-2xl">
        {/* Glow background accent */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Top Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  AI Overview Feature
                </span>
                <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-400/30">
                  {data.modelInfo?.name || "VidyaAI™ Model"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Predictive Career Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm border border-white/10 text-right">
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Model Accuracy</p>
              <p className="text-sm font-bold text-cyan-300">{data.modelInfo?.accuracyScore || "94.2%"}</p>
            </div>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 px-3 py-2 text-xs font-semibold text-blue-100 transition"
            >
              <Sliders className="h-3.5 w-3.5" />
              {showSimulator ? "Hide Simulator" : "Simulate Scores"}
              {showSimulator ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="relative z-10 mt-6 rounded-2xl bg-white/5 p-5 backdrop-blur-sm border border-white/10">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200">
                AI Executive Summary
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200 font-normal">
                {data.executiveSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 Predicted Career Matches */}
        <div className="relative z-10 mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            Top Machine Learning Career Predictions
          </h3>

          <div className="grid gap-3.5 md:grid-cols-3">
            {data.predictions?.slice(0, 3).map((item, idx) => (
              <div
                key={item.career}
                className="group relative flex flex-col justify-between rounded-2xl bg-white/[0.07] p-4 backdrop-blur-sm border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.12] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/30 text-[10px] font-bold text-cyan-300">
                      #{idx + 1}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                      {item.confidence}% Match
                    </span>
                  </div>

                  <h4 className="mt-3 text-base font-bold text-white group-hover:text-cyan-200 transition">
                    {item.career}
                  </h4>

                  <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-blue-200 mb-1.5 font-medium">
                    <span>Probability Confidence</span>
                    <span className="font-bold text-white">{item.confidence}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {item.growthOutlook}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance & Strategic Rationale */}
        <div className="relative z-10 mt-6 grid gap-4 lg:grid-cols-2">
          {/* Feature Importance */}
          <div className="rounded-2xl bg-white/[0.05] p-4.5 border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-3 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-300" />
              Model Feature Importance (Driving Factors)
            </h4>
            <div className="space-y-2.5">
              {data.featureImportances?.map((feat) => (
                <div key={feat.feature}>
                  <div className="flex justify-between text-xs text-slate-200 mb-1">
                    <span>{feat.feature}</span>
                    <span className="font-bold text-cyan-300">+{feat.impact}% impact</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${Math.min(100, feat.impact * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Strategic Insights */}
          <div className="rounded-2xl bg-white/[0.05] p-4.5 border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              AI Strategic Recommendations
            </h4>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-200">
              {data.keyInsights?.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Subject Score Simulator Panel */}
        {showSimulator && (
          <div className="relative z-10 mt-6 rounded-2xl bg-slate-900/90 p-5 border border-cyan-500/30 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" />
                  Interactive Subject Score Simulator
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust subject marks (0-100) or test report card scenarios to see real-time AI recalibration.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetScores}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUBJECT_LIST.map((subject) => {
                const val = customScores[subject] ?? 75;
                return (
                  <div key={subject} className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="truncate">{subject}</span>
                      <span className="text-cyan-300 font-bold">{val}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={val}
                      onChange={(e) => handleScoreChange(subject, e.target.value)}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={handleRunSimulation}
                disabled={simulating}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg hover:from-blue-500 hover:to-cyan-400 text-xs"
              >
                {simulating ? "Recalculating AI Model..." : "Run AI Recalibration"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
