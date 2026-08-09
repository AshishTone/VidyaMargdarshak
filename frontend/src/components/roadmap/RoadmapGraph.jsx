import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import RoadmapNodeCard from "./RoadmapNodeCard";

const nodeTypes = {
  roadmap: RoadmapNodeCard,
};

export default function RoadmapGraph({
  nodes = [],
  edges = [],
  rootNodeId,
  interactive = false,
  onSelectNode,
}) {
  const [expandedNodes, setExpandedNodes] = useState(() => new Set([rootNodeId]));

  const childMap = useMemo(() => {
    const map = new Map();
    edges.forEach((edge) => {
      const current = map.get(edge.source) || [];
      current.push(edge.target);
      map.set(edge.source, current);
    });
    return map;
  }, [edges]);

  const visibleIds = useMemo(() => {
    if (!interactive) {
      return new Set(nodes.map((node) => node.id));
    }

    const visible = new Set(
      nodes.filter((node) => node.depth <= 1 || node.id === rootNodeId).map((node) => node.id)
    );
    const queue = [...Array.from(expandedNodes).filter((nodeId) => visible.has(nodeId))];

    while (queue.length) {
      const source = queue.shift();
      (childMap.get(source) || []).forEach((target) => {
        if (!visible.has(target)) {
          visible.add(target);
          if (expandedNodes.has(target)) {
            queue.push(target);
          }
        }
      });
    }

    return visible;
  }, [childMap, expandedNodes, interactive, nodes, rootNodeId]);

  const flowNodes = useMemo(
    () =>
      nodes
        .filter((node) => visibleIds.has(node.id))
        .map((node) => ({
          id: node.id,
          type: "roadmap",
          position: node.position,
          data: node,
        })),
    [nodes, visibleIds]
  );

  const flowEdges = useMemo(
    () =>
      edges
        .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
        .map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#1e3a8a", strokeWidth: 2 },
          labelStyle: { fill: "#334155", fontWeight: 600 },
        })),
    [edges, visibleIds]
  );

  return (
    <div className="relative isolate z-0 h-[70vh] overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
      <ReactFlow
        className="relative z-0"
        fitView
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          onSelectNode?.(node.data);

          if (interactive && childMap.get(node.id)?.length) {
            setExpandedNodes((current) => {
              const next = new Set(current);
              if (next.has(node.id)) {
                next.delete(node.id);
              } else {
                next.add(node.id);
              }
              return next;
            });
          }
        }}
      >
        <Background gap={20} size={1} color="#dbeafe" />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}
