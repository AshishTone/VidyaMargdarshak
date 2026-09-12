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

  // Unified Pointer drag panning handlers (supports mouse, touch, and stylus)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // Only primary click/touch
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if not supported
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-2xl sm:rounded-[2rem] border border-slate-800 bg-[#090d16] text-white shadow-2xl overflow-hidden select-none transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "min-h-[380px] sm:min-h-[580px] w-full"
      }`}
    >
      {/* Top Toolbar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/90 px-3 sm:px-5 py-2.5 sm:py-3.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
            Flowchart Mermaid
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom & Reset controls */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-slate-300 shadow-sm">
            <button
              type="button"
              onClick={handleZoomOut}
              className="rounded-lg p-1 sm:p-1.5 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-mono font-bold text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="rounded-lg p-1 sm:p-1.5 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="ml-1 border-l border-slate-800 pl-1 sm:pl-1.5 pr-1 sm:pr-1.5 py-0.5 sm:py-1 text-slate-400 hover:text-white transition text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden min-[480px]:inline">Reset</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 sm:p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Draggable & Touch-panning Canvas Area */}
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none" }}
        className={`relative flex-1 overflow-hidden p-4 sm:p-6 flex items-center justify-center bg-[#070b12] ${
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
          <div className="z-10 max-w-lg rounded-2xl border border-rose-900/50 bg-rose-950/40 p-5 sm:p-6 text-center text-rose-200 backdrop-blur">
            <AlertCircle className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-rose-400" />
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-bold">Chart Syntax Notice</p>
            <p className="mt-1 text-[11px] sm:text-xs text-rose-300/80">{error}</p>
            <pre className="mt-3 sm:mt-4 max-h-40 sm:max-h-48 overflow-auto rounded-xl bg-black/50 p-2.5 sm:p-3 text-left font-mono text-[10px] sm:text-[11px] text-slate-300">
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
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t border-slate-800/80 bg-slate-950/90 px-3 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-indigo-500" /> Starting Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500" /> Stream Gateway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-500" /> Entrance Exam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sky-400" /> Degrees / Courses
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400" /> Career Outcome
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-500" /> Govt / Civil Service
          </span>
        </div>
      </div>
    </div>
  );
}
