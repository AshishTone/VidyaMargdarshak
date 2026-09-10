import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchLatestAssessment } from "../services/platformService";

// Human-readable labels for 10th and 12th standard domains
const names = {
  // Class 10 domains
  DEFENCE_SECURITY: "Defence & Security",
  AGRICULTURE_ALLIED: "Agriculture & Allied",
  SOCIAL_SCIENCE_HUMANITIES: "Social Science & Humanities",
  ARTS_MEDIA_CREATIVE: "Arts, Media & Creative",
  MEDICAL_HEALTH: "Medical & Health",
  COMMERCE_FINANCE_BUSINESS: "Commerce & Business",
  SCIENCE_ENGINEERING_TECH: "Science & Engineering",

  // Class 12 PCM domains
  COMPUTER_SCIENCE_AI_SOFTWARE: "Computer Science & AI",
  ENGINEERING_CORE_TECHNOLOGY: "Core Engineering",
  ARCHITECTURE_DESIGN_BUILT_ENV: "Architecture & Design",
  MATHEMATICS_STATISTICS_ANALYTICS: "Math & Data Analytics",
  SCIENCE_RESEARCH_INNOVATION: "Pure Science & Research",
  DATA_FINANCE_ECONOMICS: "Data, Finance & Economics",
  AVIATION_DEFENCE_SPACE: "Aviation, Defence & Space",

  // Class 12 PCB domains
  MEDICINE_CLINICAL_HEALTHCARE: "Clinical Medicine & Surgery",
  RESEARCH_LABORATORY_SCIENCE: "Medical & Lab Research",
  PUBLIC_HEALTH_PSYCHOLOGY_WELLBEING: "Public Health & Psychology",
  NURSING_ALLIED_HEALTH_PATIENT_CARE: "Nursing & Allied Healthcare",
  PHARMACY_PHARMACEUTICAL_SCIENCE: "Pharmacy & Drug Sciences",
  BIOTECHNOLOGY_LIFE_SCIENCES: "Biotechnology & Life Sciences",
  BIOINFORMATICS_DATA_EMERGING_LIFE_SCIENCES: "Bioinformatics & Genomics",
  ENVIRONMENT_AGRICULTURE_BIOLOGICAL_APPLICATIONS: "Agriculture & Biosystems",
};

// Distinct, pale vivid, plain solid colors
const PALE_VIVID_PALETTE = [
  { barColor: "#38bdf8", scoreColor: "text-sky-700 dark:text-sky-300" }, // Sky Blue
  { barColor: "#34d399", scoreColor: "text-emerald-700 dark:text-emerald-300" }, // Mint / Emerald
  { barColor: "#fbbf24", scoreColor: "text-amber-700 dark:text-amber-300" }, // Warm Amber
  { barColor: "#fb7185", scoreColor: "text-rose-700 dark:text-rose-300" }, // Soft Rose
  { barColor: "#a78bfa", scoreColor: "text-violet-700 dark:text-violet-300" }, // Soft Violet
  { barColor: "#2dd4bf", scoreColor: "text-teal-700 dark:text-teal-300" }, // Teal
  { barColor: "#a3e635", scoreColor: "text-lime-700 dark:text-lime-300" }, // Lime
  { barColor: "#fb923c", scoreColor: "text-orange-700 dark:text-orange-300" }, // Peach / Orange
  { barColor: "#c084fc", scoreColor: "text-purple-700 dark:text-purple-300" }, // Orchid / Purple
  { barColor: "#818cf8", scoreColor: "text-indigo-700 dark:text-indigo-300" }, // Indigo / Periwinkle
  { barColor: "#94a3b8", scoreColor: "text-slate-700 dark:text-slate-300" }, // Steel / Slate
  { barColor: "#f472b6", scoreColor: "text-pink-700 dark:text-pink-300" }, // Pink
];

// Explicit solid color assignment for all 10th and 12th standard categories
const categoryStyles = {
  // Class 10 domains
  SCIENCE_ENGINEERING_TECH: { barColor: "#38bdf8", scoreColor: "text-sky-700 dark:text-sky-300" },
  MEDICAL_HEALTH: { barColor: "#2dd4bf", scoreColor: "text-teal-700 dark:text-teal-300" },
  COMMERCE_FINANCE_BUSINESS: { barColor: "#fbbf24", scoreColor: "text-amber-700 dark:text-amber-300" },
  ARTS_MEDIA_CREATIVE: { barColor: "#fb7185", scoreColor: "text-rose-700 dark:text-rose-300" },
  SOCIAL_SCIENCE_HUMANITIES: { barColor: "#a78bfa", scoreColor: "text-violet-700 dark:text-violet-300" },
  AGRICULTURE_ALLIED: { barColor: "#a3e635", scoreColor: "text-lime-700 dark:text-lime-300" },
  DEFENCE_SECURITY: { barColor: "#94a3b8", scoreColor: "text-slate-700 dark:text-slate-300" },

  // Class 12 PCM domains
  COMPUTER_SCIENCE_AI_SOFTWARE: { barColor: "#38bdf8", scoreColor: "text-sky-700 dark:text-sky-300" },
  ENGINEERING_CORE_TECHNOLOGY: { barColor: "#fb923c", scoreColor: "text-orange-700 dark:text-orange-300" },
  ARCHITECTURE_DESIGN_BUILT_ENV: { barColor: "#f472b6", scoreColor: "text-pink-700 dark:text-pink-300" },
  MATHEMATICS_STATISTICS_ANALYTICS: { barColor: "#818cf8", scoreColor: "text-indigo-700 dark:text-indigo-300" },
  SCIENCE_RESEARCH_INNOVATION: { barColor: "#2dd4bf", scoreColor: "text-teal-700 dark:text-teal-300" },
  DATA_FINANCE_ECONOMICS: { barColor: "#fbbf24", scoreColor: "text-amber-700 dark:text-amber-300" },
  AVIATION_DEFENCE_SPACE: { barColor: "#94a3b8", scoreColor: "text-slate-700 dark:text-slate-300" },

  // Class 12 PCB domains
  MEDICINE_CLINICAL_HEALTHCARE: { barColor: "#34d399", scoreColor: "text-emerald-700 dark:text-emerald-300" },
  RESEARCH_LABORATORY_SCIENCE: { barColor: "#2dd4bf", scoreColor: "text-teal-700 dark:text-teal-300" },
  PUBLIC_HEALTH_PSYCHOLOGY_WELLBEING: { barColor: "#a78bfa", scoreColor: "text-violet-700 dark:text-violet-300" },
  NURSING_ALLIED_HEALTH_PATIENT_CARE: { barColor: "#fb7185", scoreColor: "text-rose-700 dark:text-rose-300" },
  PHARMACY_PHARMACEUTICAL_SCIENCE: { barColor: "#fbbf24", scoreColor: "text-amber-700 dark:text-amber-300" },
  BIOTECHNOLOGY_LIFE_SCIENCES: { barColor: "#38bdf8", scoreColor: "text-sky-700 dark:text-sky-300" },
  BIOINFORMATICS_DATA_EMERGING_LIFE_SCIENCES: { barColor: "#c084fc", scoreColor: "text-purple-700 dark:text-purple-300" },
  ENVIRONMENT_AGRICULTURE_BIOLOGICAL_APPLICATIONS: { barColor: "#a3e635", scoreColor: "text-lime-700 dark:text-lime-300" },
};

const matchLevel = (score) =>
  score >= 75 ? "Strong Match" : score >= 55 ? "Good Match" : "Explore";

const labelFor = (category) =>
  names[category] ||
  category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ResultsPage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchLatestAssessment().then(setReport).catch(() => null);
  }, []);

  if (!report?.result) {
    return (
      <SectionCard>
        <p className="section-title">No results yet</p>
        <Link to="/assessment" className="mt-4 inline-flex">
          <Button>Take the assessment</Button>
        </Link>
      </SectionCard>
    );
  }

  const structured = report.structuredRecommendations;
  const top = report.result.results[0];
  const closelyMatched =
    top &&
    report.result.results[1] &&
    top.interestIndex - report.result.results[1].interestIndex < 5;
  const after12 = report.assessmentType === "AFTER12";
  const canViewRoadmap = structured?.recommendations?.length >= 2;

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-800">
          VidyaMargdarshak · {after12 ? `After-12th ${structured?.stream || ""}` : "After-10th"} Guidance Report
        </p>
        <h1 className="mt-2 text-3xl font-black">Your Interest Profile</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Your highest area of interest is <strong>{labelFor(top.categoryId)}</strong>. This shows your current preferences, not a guaranteed aptitude, ability, or career outcome.
        </p>
      </SectionCard>

      <SectionCard>
        <div className="flex h-80 items-end justify-around gap-3 overflow-x-auto px-2 pt-6">
          {report.result.results.map((item, index) => {
            const style =
              categoryStyles[item.categoryId] ||
              PALE_VIVID_PALETTE[index % PALE_VIVID_PALETTE.length];

            return (
              <div
                key={item.categoryId}
                className="flex h-full min-w-20 flex-1 flex-col items-center justify-end group transition-all"
              >
                <span className={`mb-2 text-sm font-black ${style.scoreColor}`}>
                  {item.interestIndex.toFixed(0)}
                </span>
                <div
                  className="w-full max-w-20 rounded-t-xl shadow-xs transition-all group-hover:brightness-95"
                  style={{
                    height: `${Math.max(item.interestIndex, 4)}%`,
                    backgroundColor: style.barColor,
                  }}
                />
                <span className="mt-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {labelFor(item.categoryId)}
                </span>
                <span className="mt-1 text-[11px] text-slate-400">
                  Uncertainty {item.uncertaintyRate.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {closelyMatched ? (
        <SectionCard>
          <p className="section-title">Your interests are closely matched</p>
          <p className="mt-2 text-sm text-slate-600">
            {labelFor(top.categoryId)} and {labelFor(report.result.results[1].categoryId)} are both strong areas to explore.
          </p>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <p className="section-title">Your recommended courses</p>
          <div className="mt-4 space-y-3">
            {structured?.recommendations.slice(0, 3).map((item, index) => (
              <div key={item.pathway} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-bold">
                    {index + 1}. {item.pathway}
                  </p>
                  <p className="font-semibold text-blue-800">{item.matchScore}/100</p>
                </div>
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  {matchLevel(item.matchScore)}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Interest {item.interestFit} · Preference {item.preferenceFit} · Academic {item.academicFit === "UNAVAILABLE" ? "Unavailable" : item.academicFit}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Eligibility: {item.eligibility.replaceAll("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Why these may suit you</p>
          {report.aiExplanation ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-7 text-slate-700">{report.aiExplanation.summary}</p>
              {report.aiExplanation.recommendations.slice(0, 3).map((item) => (
                <div key={item.pathway} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold">{item.pathway}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.why}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {report.aiExplanationError || "Your explanation is being prepared."}
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard>
        <p className="section-title">Next: your personalized roadmap</p>
        <p className="mt-2 text-sm text-slate-600">
          See the next educational steps, admission preparation, and course exploration actions for your highest-ranked options.
        </p>
        {canViewRoadmap ? (
          <Link to="/my-roadmap" className="mt-5 inline-flex">
            <Button className="px-6 py-3">View My Personalized Roadmap</Button>
          </Link>
        ) : (
          <p className="mt-3 text-sm text-amber-700">
            Add Class-12 subject marks in your profile to calculate at least two eligible course pathways.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
