import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  themeCSS: `
    .node rect, .node polygon, .node path {
      rx: 18px !important;
      ry: 18px !important;
      stroke-linejoin: round !important;
    }
    .node .label {
      font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
      font-weight: 600 !important;
      font-size: 12px !important;
    }
    .edgePath path {
      stroke-width: 2.2px !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    .arrowheadPath {
      fill: #94a3b8 !important;
    }
  `,
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
    nodeSpacing: 50,
    rankSpacing: 60,
  },
});

export default function MermaidViewer({
  chart = "",
  title = "Personalized Education & Career Roadmap",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!chart || typeof chart !== "string") return;

    let isMounted = true;
    const renderId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid
      .render(renderId, chart)
      .then(({ svg }) => {
        if (isMounted) {
          // Inject curvy rounded node styling into SVG definition
          const styleTag = `<style>
            .node rect, .node polygon { rx: 18px !important; ry: 18px !important; stroke-linejoin: round !important; }
            .edgePath path { stroke-width: 2.2px !important; stroke-linecap: round !important; stroke-linejoin: round !important; }
          </style>`;
          const styledSvg = svg.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
          setSvgContent(styledSvg);
          setError(null);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      })
      .catch((err) => {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render chart syntax.");
        }
      });

    return () => {
      isMounted = false;
      const el = document.getElementById(renderId);
      if (el) el.remove();
    };
  }, [chart]);

  // Mouse wheel zoom in / out with passive: false to prevent outer page scroll
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(3.5, Math.max(0.3, prevZoom * zoomFactor));
        return Number(nextZoom.toFixed(2));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, Number((z - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Mouse drag panning handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only drag on left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-[2rem] border border-slate-800 bg-[#090d16] text-white shadow-2xl overflow-hidden select-none transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "min-h-[580px] w-full"
      }`}
    >
      {/* Top Toolbar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Flowchart Mermaid
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom & Reset controls */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-slate-300 shadow-sm">
            <button
              type="button"
              onClick={handleZoomOut}
              className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="ml-1 border-l border-slate-800 pl-1 pr-1.5 py-1 text-slate-400 hover:text-white transition text-xs font-semibold flex items-center gap-1"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Draggable & Mouse-Wheel Zoomable Canvas Area */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 overflow-hidden p-6 flex items-center justify-center bg-[#070b12] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {error ? (
          <div className="z-10 max-w-lg rounded-2xl border border-rose-900/50 bg-rose-950/40 p-6 text-center text-rose-200 backdrop-blur">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
            <p className="mt-3 text-sm font-bold">Chart Syntax Notice</p>
            <p className="mt-1 text-xs text-rose-300/80">{error}</p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-black/50 p-3 text-left font-mono text-[11px] text-slate-300">
              {chart}
            </pre>
          </div>
        ) : (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.12s ease-out",
            }}
            className="max-w-none pointer-events-none [&_.node_rect]:!rx-[18px] [&_.node_rect]:!ry-[18px] [&_.node_polygon]:!rx-[18px] [&_.node_polygon]:!ry-[18px]"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Legend Footer */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-950/90 px-6 py-2.5 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Starting Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Stream Gateway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Entrance Exam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Degrees / Courses
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Career Outcome
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Govt / Civil Service
          </span>
        </div>
      </div>
    </div>
  );
}
