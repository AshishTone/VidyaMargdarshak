import { memo, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  GraduationCap,
  Briefcase,
  Compass,
  FileCheck2,
  Award,
  ArrowRight,
} from "lucide-react";

function MiniNodeCard({ data }) {
  const type = (data.type || "").toUpperCase();

  let Icon = GraduationCap;
  let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  let borderStyle = "border-slate-200 bg-white";

  if (type.includes("START") || type.includes("MILESTONE")) {
    Icon = Compass;
    badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";
    borderStyle = "border-indigo-300 bg-gradient-to-br from-indigo-50/50 to-white";
  } else if (type.includes("EXAM") || type.includes("TEST")) {
    Icon = FileCheck2;
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    borderStyle = "border-amber-300 bg-gradient-to-br from-amber-50/40 to-white";
  } else if (type.includes("CAREER") || type.includes("OUTCOME") || type.includes("JOB")) {
    Icon = Briefcase;
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    borderStyle = "border-emerald-300 bg-gradient-to-br from-emerald-50/40 to-white";
  } else if (type.includes("SPECIAL") || type.includes("POST")) {
    Icon = Award;
    badgeColor = "bg-purple-100 text-purple-800 border-purple-200";
  }

  return (
    <div
      className={`min-w-[190px] max-w-[220px] rounded-2xl border p-3 shadow-md transition hover:scale-105 hover:shadow-lg ${borderStyle}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-blue-600"
      />

      <div className="flex items-center justify-between gap-1">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${badgeColor}`}
        >
          <Icon className="h-2.5 w-2.5" />
          <span>{data.stepLabel || type.replaceAll("_", " ")}</span>
        </span>
        {data.duration && (
          <span className="text-[9px] font-bold text-slate-500">
            {data.duration}
          </span>
        )}
      </div>

      <h5 className="mt-2 text-xs font-black leading-snug text-slate-900 line-clamp-2">
        {data.title || data.label}
      </h5>

      {data.description && (
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500 line-clamp-2">
          {data.description}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-blue-600"
      />
    </div>
  );
}

const miniNodeTypes = {
  miniNode: memo(MiniNodeCard),
};

function InnerSmallGraph({ pathwayNodes = [] }) {
  // Build horizontal non-colliding layout
  const { nodes, edges } = useMemo(() => {
    const X_GAP = 240;
    const X_START = 40;
    const Y_POS = 75;

    const nList = pathwayNodes.map((n, idx) => ({
      id: n.id || `p_node_${idx}`,
      type: "miniNode",
      position: { x: idx * X_GAP + X_START, y: Y_POS },
      data: {
        ...n,
        stepLabel: idx === 0 ? "Start Point" : idx === pathwayNodes.length - 1 ? "Target Outcome" : `Step ${idx + 1}`,
      },
    }));

    const eList = [];
    for (let i = 0; i < pathwayNodes.length - 1; i++) {
      const source = pathwayNodes[i].id || `p_node_${i}`;
      const target = pathwayNodes[i + 1].id || `p_node_${i + 1}`;
      eList.push({
        id: `pe_${source}_${target}`,
        source,
        target,
        type: "bezier",
        animated: true,
        style: { stroke: "#2563eb", strokeWidth: 2.5 },
      });
    }

    return { nodes: nList, edges: eList };
  }, [pathwayNodes]);

  return (
    <div className="h-[200px] w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 shadow-inner overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={miniNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.3}
        preventScrolling={false}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background gap={20} size={1} color="#cbd5e1" className="opacity-40" />
      </ReactFlow>
    </div>
  );
}

export default function SmallPathwayGraph({ pathwayNodes }) {
  return (
    <ReactFlowProvider>
      <InnerSmallGraph pathwayNodes={pathwayNodes} />
    </ReactFlowProvider>
  );
}
