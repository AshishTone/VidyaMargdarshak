import { Handle, Position } from "@xyflow/react";

export default function RoadmapNodeCard({ data }) {
  const palette = {
    stage: "from-slate-950 to-slate-800 text-white",
    stream: "from-blue-900 to-blue-700 text-white",
    course: "from-white to-slate-50 text-slate-900 border border-slate-200",
    exam: "from-amber-50 to-orange-100 text-amber-900 border border-amber-200",
    career: "from-emerald-50 to-emerald-100 text-emerald-900 border border-emerald-200",
    milestone: "from-indigo-50 to-blue-100 text-indigo-900 border border-indigo-200",
  };

  return (
    <div
      className={`min-w-[180px] rounded-2xl bg-gradient-to-br px-4 py-3 shadow-lg relative ${palette[data.category] || palette.course}`}
    >
      <Handle type="target" position={Position.Left} id="target-left" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ opacity: 0 }} />
      
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-75">
        {data.category}
      </p>
      <p className="mt-2 text-sm font-bold">{data.label}</p>
      {data.duration ? <p className="mt-1 text-xs opacity-80">{data.duration}</p> : null}

      <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />
    </div>
  );
}
