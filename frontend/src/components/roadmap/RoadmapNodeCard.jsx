import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Compass,
  GitBranch,
  FileCheck2,
  GraduationCap,
  Award,
  Briefcase,
  Landmark,
  Microscope,
  Wrench,
  Layers,
  CheckCircle2,
} from "lucide-react";

function RoadmapNodeCard({ data, selected }) {
  const type = (data.type || "").toLowerCase();
  const id = (data.id || "").toLowerCase();
  const category = (data.category || type || "").toLowerCase();

  // Determine icon & theme based on taxonomy
  let Icon = GraduationCap;
  let theme = {
    badge: "Course",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    cardBg: "bg-white border-slate-200 text-slate-900 shadow-sm",
    accent: "text-blue-600",
  };

  if (type === "root" || id.startsWith("root_") || data.isUserNode) {
    Icon = Compass;
    theme = {
      badge: data.isUserNode ? "Personalized Starting Point" : "Starting Milestone",
      badgeColor: "bg-indigo-500/30 text-indigo-200 border-indigo-400/40",
      cardBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/50 shadow-xl",
      accent: "text-indigo-400",
    };
  } else if (type === "stream" || id.startsWith("stream_") || id.startsWith("a001_") || id.startsWith("a002_") || id.startsWith("a003_")) {
    Icon = GitBranch;
    theme = {
      badge: "Stream Gateway",
      badgeColor: "bg-blue-500/20 text-blue-200 border-blue-400/30",
      cardBg: "bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-blue-500/40 shadow-lg",
      accent: "text-blue-300",
    };
  } else if (id.startsWith("exam_") || (type === "pathway" && !id.startsWith("a00"))) {
    Icon = FileCheck2;
    theme = {
      badge: "Entrance Route / Exam",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      cardBg: "bg-gradient-to-br from-amber-50 to-orange-50 text-slate-900 border-amber-300 shadow-md",
      accent: "text-amber-700",
    };
  } else if (type === "career_group" || id.startsWith("cg_")) {
    Icon = Layers;
    theme = {
      badge: "Career Domain",
      badgeColor: "bg-teal-500/20 text-teal-200 border-teal-400/40",
      cardBg: "bg-gradient-to-br from-teal-950 to-slate-900 text-white border-teal-500/40 shadow-lg",
      accent: "text-teal-300",
    };
  } else if (type === "career" || id.startsWith("career_") || id === "diploma_je" || id === "skill_worker") {
    Icon = Briefcase;
    theme = {
      badge: "Career Outcome",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cardBg: "bg-white border-emerald-300 text-slate-900 shadow-sm",
      accent: "text-emerald-600",
    };
  } else if (type === "government" || id.startsWith("gov_") || id === "diploma_gov" || id === "iti_gov") {
    Icon = Landmark;
    theme = {
      badge: "Government & Public Service",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
      cardBg: "bg-gradient-to-br from-purple-50 to-slate-50 border-purple-300 text-slate-900 shadow-sm",
      accent: "text-purple-700",
    };
  } else if (id.startsWith("dr_") || id === "research_phd") {
    Icon = Microscope;
    theme = {
      badge: "Research & Doctorate",
      badgeColor: "bg-violet-100 text-violet-900 border-violet-300",
      cardBg: "bg-white border-violet-300 text-slate-900 shadow-sm",
      accent: "text-violet-700",
    };
  } else if (type === "professional" || id.startsWith("p_")) {
    Icon = Award;
    theme = {
      badge: "Chartered Professional",
      badgeColor: "bg-sky-100 text-sky-900 border-sky-300",
      cardBg: "bg-white border-sky-300 text-slate-900 shadow-sm",
      accent: "text-sky-700",
    };
  } else if (type === "vocational" || id.startsWith("iti_") || id.startsWith("v00")) {
    Icon = Wrench;
    theme = {
      badge: "Vocational / Trade",
      badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
      cardBg: "bg-white border-orange-300 text-slate-900 shadow-sm",
      accent: "text-orange-600",
    };
  } else if (id.startsWith("pg_") || id.includes("_dm") || id.includes("_mch")) {
    Icon = Award;
    theme = {
      badge: "Postgraduate / Specialist",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
      cardBg: "bg-white border-indigo-200 text-slate-900 shadow-sm",
      accent: "text-indigo-600",
    };
  }

  // Dynamic visual states for smooth interactivity
  const isDimmed = data.dimmed;
  const isHighlighted = data.highlighted;
  const isSelected = selected || data.selected || data.highlight;

  return (
    <div
      className={`group relative min-w-[240px] max-w-[280px] rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${
        theme.cardBg
      } ${
        isDimmed
          ? "opacity-25 grayscale scale-[0.96] blur-[0.3px]"
          : "opacity-100 hover:scale-[1.02] hover:shadow-xl"
      } ${
        isSelected
          ? "ring-4 ring-amber-400 ring-offset-2 shadow-2xl scale-[1.04]"
          : isHighlighted
          ? "ring-4 ring-blue-500 ring-offset-1 shadow-2xl scale-[1.03]"
          : ""
      }`}
    >
      {/* Handles for clean React Flow graph edge connection */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-blue-500 transition hover:!scale-125"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-blue-500 opacity-0"
      />

      {/* Header Badge with Icon */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${theme.badgeColor}`}
        >
          <Icon className="h-3 w-3 shrink-0" />
          <span className="truncate">{theme.badge}</span>
        </div>

        {data.stream ? (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 border border-slate-200 shrink-0">
            {data.stream}
          </span>
        ) : null}
      </div>

      {/* Node Title */}
      <div className="mt-2.5">
        <h4 className="text-sm font-extrabold leading-snug tracking-tight">
          {data.label || data.title}
        </h4>

        {/* Subtitle / Description */}
        {data.description ? (
          <p className="mt-1 text-[11px] leading-relaxed opacity-75 line-clamp-2">
            {data.description}
          </p>
        ) : data.combination ? (
          <p className="mt-1 text-[11px] leading-relaxed opacity-75 line-clamp-2">
            {data.combination}
          </p>
        ) : null}
      </div>

      {/* Footer metadata chips */}
      {(data.duration || data.duration_years || data.category || data.level) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-current/10 text-[10px] opacity-80">
          {data.duration && (
            <span className="inline-flex items-center gap-1 rounded bg-black/5 px-1.5 py-0.5 font-medium dark:bg-white/10">
              ⏱ {data.duration}
            </span>
          )}
          {data.entry_after && (
            <span className="inline-flex items-center gap-1 rounded bg-black/5 px-1.5 py-0.5 font-medium dark:bg-white/10">
              🚪 After {data.entry_after}
            </span>
          )}
        </div>
      )}

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-blue-600 transition hover:!scale-125"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-blue-600 opacity-0"
      />
    </div>
  );
}

export default memo(RoadmapNodeCard);
