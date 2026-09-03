import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Compass,
  Maximize2,
  Minimize2,
  Briefcase,
  ChevronDown,
  Info,
} from "lucide-react";
import RoadmapNodeCard from "./RoadmapNodeCard";
import { CAREER_PATHWAYS_10TH, CAREER_PATHWAYS_12TH } from "../../utils/careerPathways";
import { computeStrictHierarchicalLayout } from "../../utils/roadmapLayout";

const nodeTypes = {
  roadmap: RoadmapNodeCard,
  root: RoadmapNodeCard,
  stream: RoadmapNodeCard,
  pathway: RoadmapNodeCard,
  course: RoadmapNodeCard,
  career_group: RoadmapNodeCard,
  career: RoadmapNodeCard,
  government: RoadmapNodeCard,
  research: RoadmapNodeCard,
  professional: RoadmapNodeCard,
  vocational: RoadmapNodeCard,
};

function FlowCanvas({
  rawNodes = [],
  rawEdges = [],
  onSelectNode,
  selectedNodeId,
  isClass10 = false,
  title = "Career Roadmap Graph",
  forcedNodes = null,
  forcedEdges = null,
}) {
  const reactFlow = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Curated Career Pathways list
  const careerOptions = useMemo(() => {
    return isClass10 ? CAREER_PATHWAYS_10TH : CAREER_PATHWAYS_12TH;
  }, [isClass10]);

  // Selected Career Path state
  const [selectedCareerId, setSelectedCareerId] = useState(
    careerOptions[0]?.id || "tech_software_ai"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Map of raw nodes by id for fast lookup
  const rawNodeMap = useMemo(() => {
    const map = new Map();
    rawNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [rawNodes]);

  // Compute Clean, Strict Hierarchical Layout with ZERO Collisions & No Backwards Edges
  useEffect(() => {
    // Case A: Custom / Forced Nodes & Edges (e.g. Personalized Roadmap Track)
    if (forcedNodes && forcedEdges && forcedNodes.length > 0) {
      const { nodes: layoutNodes, edges: layoutEdges } = computeStrictHierarchicalLayout(
        forcedNodes,
        forcedEdges
      );
      setNodes(layoutNodes);
      setEdges(layoutEdges);
      setTimeout(() => reactFlow.fitView({ duration: 650, padding: 0.28 }), 100);
      return;
    }

    if (!rawNodes.length) return;

    // Case B: Master Roadmap One-Career-At-A-Time Focus
    const currentCareer =
      careerOptions.find((c) => c.id === selectedCareerId) || careerOptions[0];

    if (!currentCareer) return;

    // Gather nodes and edges for this specific career
    const activeRawNodes = [];
    const activeNodeIds = new Set();

    currentCareer.nodes.forEach((nItem) => {
      const rawNode = rawNodeMap.get(nItem.id);
      if (rawNode) {
        activeNodeIds.add(nItem.id);
        activeRawNodes.push({
          ...rawNode,
          col: nItem.col,
          row: nItem.row,
          highlight: nItem.highlight,
          data: {
            ...rawNode.data,
            highlight: nItem.highlight,
            selected: selectedNodeId === nItem.id,
          },
        });
      } else {
        // Fallback placeholder node
        activeNodeIds.add(nItem.id);
        activeRawNodes.push({
          id: nItem.id,
          type: "course",
          col: nItem.col,
          row: nItem.row,
          highlight: nItem.highlight,
          data: {
            id: nItem.id,
            label: nItem.id.replaceAll("_", " "),
            highlight: nItem.highlight,
            selected: selectedNodeId === nItem.id,
          },
        });
      }
    });

    const activeRawEdges = (currentCareer.edges || []).filter(
      (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );

    // Apply strict hierarchical DAG layout
    const { nodes: layoutNodes, edges: layoutEdges } = computeStrictHierarchicalLayout(
      activeRawNodes,
      activeRawEdges
    );

    setNodes(layoutNodes);
    setEdges(layoutEdges);

    // Smoothly center the active career pathway
    setTimeout(() => {
      reactFlow.fitView({ duration: 750, padding: 0.3 });
    }, 80);
  }, [
    rawNodes,
    rawEdges,
    rawNodeMap,
    careerOptions,
    selectedCareerId,
    selectedNodeId,
    forcedNodes,
    forcedEdges,
    reactFlow,
    setNodes,
    setEdges,
  ]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (_, node) => {
      onSelectNode?.(node.data);
    },
    [onSelectNode]
  );

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const activeCareerMeta = careerOptions.find((c) => c.id === selectedCareerId);

  return (
    <div
      ref={containerRef}
      className={`relative isolate flex flex-col rounded-[2rem] border border-slate-200 bg-slate-900/5 shadow-2xl backdrop-blur transition-all overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none bg-slate-950"
          : "h-[74vh] w-full"
      }`}
    >
      {/* Top Toolbar with One-Career Selector */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        {/* Career Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Focus Career:</span>
          </div>

          <div className="relative">
            <select
              value={selectedCareerId}
              onChange={(e) => {
                setSelectedCareerId(e.target.value);
              }}
              className="h-9 appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-8 text-xs font-extrabold text-slate-800 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
            >
              {careerOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.title} ({c.stream})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Career Description Pill & Controls */}
        <div className="flex items-center gap-2">
          {activeCareerMeta && (
            <span className="hidden lg:inline-block max-w-sm truncate text-xs text-slate-500">
              {activeCareerMeta.description}
            </span>
          )}

          <button
            type="button"
            onClick={() => reactFlow.fitView({ duration: 700, padding: 0.3 })}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
            title="Fit View"
          >
            <Compass className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* React Flow Canvas with smooth bezier edges */}
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3, duration: 600 }}
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: "bezier",
            animated: true,
            style: { stroke: "#2563eb", strokeWidth: 2.5 },
          }}
          className="bg-slate-50 dark:bg-slate-950"
        >
          <Background gap={28} size={1} color="#cbd5e1" className="opacity-50" />
          <Controls className="!m-4 !rounded-2xl !border !border-slate-200 !bg-white/90 !shadow-lg backdrop-blur" />
          <MiniMap
            zoomable
            pannable
            className="!m-4 !rounded-2xl !border !border-slate-200 !bg-white/90 !shadow-lg backdrop-blur"
            nodeColor={(node) => {
              const id = node.id.toLowerCase();
              if (id.startsWith("root_") || id === "user-root") return "#1e293b";
              if (id.startsWith("stream_") || id.startsWith("a00")) return "#2563eb";
              if (id.startsWith("exam_")) return "#f59e0b";
              if (id.startsWith("career_") || id.startsWith("cg_")) return "#10b981";
              if (id.startsWith("gov_")) return "#8b5cf6";
              return "#38bdf8";
            }}
          />
        </ReactFlow>

        {/* Clean Info Banner (No Sparkle AI Icon) */}
        <div className="pointer-events-none absolute bottom-4 left-6 z-10 flex items-center gap-2 rounded-full bg-slate-900/85 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
          <Info className="h-3.5 w-3.5 text-blue-400" />
          <span>Click any milestone to inspect degree eligibility and career outcomes</span>
        </div>
      </div>
    </div>
  );
}

export default function RoadmapGraph(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvas
        rawNodes={props.nodes}
        rawEdges={props.edges}
        onSelectNode={props.onSelectNode}
        selectedNodeId={props.selectedNodeId}
        isClass10={props.isClass10}
        title={props.title}
        forcedNodes={props.forcedNodes}
        forcedEdges={props.forcedEdges}
      />
    </ReactFlowProvider>
  );
}
