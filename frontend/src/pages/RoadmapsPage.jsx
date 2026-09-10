import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import RoadmapGraph from "../components/roadmap/RoadmapGraph";
import MermaidViewer from "../components/roadmap/MermaidViewer";
import useAuth from "../hooks/useAuth";
import {
  fetchPersonalizedRoadmap,
  fetchRoadmap10th,
  fetchRoadmap12th,
} from "../services/platformService";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Layers,
  ArrowLeft,
  ArrowRight,
  Target,
  FileCheck2,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Info,
} from "lucide-react";

export default function RoadmapsPage({ publicOnly = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Default to 10th or 12th master roadmap initially so new users don't see an empty or premature personalized chart
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.classLevel === "10") {
      return "10th";
    }
    return "12th";
  });

  // Strict check: 10th student never sees 12th tab, and 12th student never sees 10th tab
  useEffect(() => {
    if (user?.classLevel === "10" && activeTab === "12th") {
      setActiveTab("10th");
    } else if (user?.classLevel === "12" && activeTab === "10th") {
      setActiveTab("12th");
    }
  }, [user?.classLevel, activeTab]);

  const [roadmap12th, setRoadmap12th] = useState(null);
  const [roadmap10th, setRoadmap10th] = useState(null);
  const [personalizedRoadmap, setPersonalizedRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [personalizedError, setPersonalizedError] = useState("");

  // Load 12th master roadmap
  useEffect(() => {
    fetchRoadmap12th()
      .then((data) => {
        setRoadmap12th(data);
        if (activeTab === "12th" && data?.nodes?.length) {
          setSelectedNode(data.nodes[0].data || data.nodes[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch 12th roadmap:", err))
      .finally(() => setLoading(false));
  }, []);

  // Load 10th master roadmap
  useEffect(() => {
    fetchRoadmap10th()
      .then((data) => {
        setRoadmap10th(data);
      })
      .catch((err) => console.error("Failed to fetch 10th roadmap:", err));
  }, []);

  // Load personalized roadmap
  useEffect(() => {
    if (!user || publicOnly) return;

    fetchPersonalizedRoadmap()
      .then((data) => {
        setPersonalizedRoadmap(data);
        const firstPath = data.recommendedPaths?.[0];
        if (firstPath) {
          setSelectedPathId(firstPath.id);
          if (activeTab === "personalized" && firstPath.graph?.nodes?.length) {
            setSelectedNode(firstPath.graph.nodes[0].data || firstPath.graph.nodes[0]);
          }
        }
      })
      .catch((error) => {
        setPersonalizedError(
          error.response?.data?.message ||
            "Unable to generate personalized roadmap at this time."
        );
      });
  }, [publicOnly, user]);

  // If user opens personalized tab without having completed assessment, redirect to assessment
  useEffect(() => {
    if (activeTab === "personalized" && !publicOnly && user && !loading) {
      if (!personalizedRoadmap?.mermaidChart && personalizedError) {
        navigate("/assessment");
      }
    }
  }, [activeTab, publicOnly, user, loading, personalizedRoadmap, personalizedError, navigate]);

  // Current personalized track
  const currentPersonalizedPath = useMemo(() => {
    if (!personalizedRoadmap?.recommendedPaths?.length) return null;
    return (
      personalizedRoadmap.recommendedPaths.find((p) => p.id === selectedPathId) ||
      personalizedRoadmap.recommendedPaths[0]
    );
  }, [personalizedRoadmap, selectedPathId]);

  // Determine current active graph data
  const activeGraph = useMemo(() => {
    if (activeTab === "personalized") {
      return currentPersonalizedPath
        ? currentPersonalizedPath.graph
        : { nodes: [], edges: [] };
    }
    if (activeTab === "10th") {
      return roadmap10th || { nodes: [], edges: [] };
    }
    return roadmap12th || { nodes: [], edges: [] };
  }, [activeTab, currentPersonalizedPath, roadmap10th, roadmap12th]);

  // Handle node selection
  const handleSelectNode = (nodeData) => {
    setSelectedNode(nodeData);
  };

  const content = (
    <div className="space-y-6">
      {/* Public Top Header Bar with Back Button */}
      {publicOnly && (
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 bg-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="VidyaMargdarshak logo" className="h-8 w-auto" />
              <span className="font-bold text-slate-900 hidden sm:inline">VidyaMargdarshak</span>
            </div>
          </div>
          <div>
            <Link to="/login">
              <Button className="text-xs sm:text-sm px-4 py-2">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
      {/* Hero Header */}
      <SectionCard className="overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              <Compass className="h-3.5 w-3.5 text-blue-200" />
              Career Knowledge Graph
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Complete Education & Career Pathways
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-blue-100/90">
              Explore verified Indian education pathways across degrees, polytechnics, entrance exams, and career domains.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.8rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Current View Mode
              </span>
              <span className="rounded-full bg-blue-500/30 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {activeTab === "12th"
                  ? "Class 12 Master"
                  : activeTab === "10th"
                  ? "Class 10 Master"
                  : "Personalized Track"}
              </span>
            </div>
            <p className="text-xl font-black">
              {activeTab === "12th"
                ? "Post-12th Career Roadmaps"
                : activeTab === "10th"
                ? "Post-10th Career Roadmaps"
                : `Tailored Roadmap for ${user?.name || "You"}`}
            </p>
            <p className="text-xs leading-relaxed text-blue-100">
              {activeTab === "personalized"
                ? "Tailored roadmap based on your assessment results."
                : "Select any track to inspect its verified milestone sequence."}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Main Roadmap Mode Switcher */}
      <SectionCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* If student is 10th, NEVER show the 12th Master Roadmap */}
            {(!user || user.classLevel !== "10") && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("12th");
                  if (roadmap12th?.nodes?.length) {
                    setSelectedNode(roadmap12th.nodes[0].data || roadmap12th.nodes[0]);
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition cursor-pointer ${
                  activeTab === "12th"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Class 12 Master Roadmap</span>
              </button>
            )}

            {/* If student is 12th, NEVER show the 10th Master Roadmap */}
            {(!user || user.classLevel !== "12") && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("10th");
                  if (roadmap10th?.nodes?.length) {
                    setSelectedNode(roadmap10th.nodes[0].data || roadmap10th.nodes[0]);
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition cursor-pointer ${
                  activeTab === "10th"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Class 10 Master Roadmap</span>
              </button>
            )}

            {!publicOnly && (
              <button
                type="button"
                onClick={() => {
                  if (!personalizedRoadmap?.mermaidChart) {
                    navigate("/assessment");
                  } else {
                    setActiveTab("personalized");
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition cursor-pointer ${
                  activeTab === "personalized"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Target className="h-4 w-4 text-indigo-200" />
                <span>My Personalized Roadmap</span>
              </button>
            )}
          </div>

          {!user && (
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:underline">
              Sign in to unlock personalized pathing →
            </Link>
          )}
        </div>
      </SectionCard>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "personalized" && !publicOnly ? (
        user && personalizedRoadmap?.mermaidChart ? (
          <div className="space-y-6">
            {/* Header info banner */}
            <SectionCard className="border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200">
                    <Compass className="h-3.5 w-3.5 text-indigo-200" />
                    <span>Personalized AI Flowchart</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {personalizedRoadmap.title || "Your Personalized Education-to-Career Pathway"}
                  </h2>
                  <p className="mt-1 text-xs text-blue-100/90 max-w-2xl leading-relaxed">
                    {personalizedRoadmap.summary ||
                      "Tailored strictly to your assessment scores and academic stream."}
                  </p>
                </div>

                {(personalizedRoadmap.topCourses?.length > 0
                  ? personalizedRoadmap.topCourses
                  : personalizedRoadmap.topInterests || []
                ).map((course, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>{course}</span>
                  </span>
                ))}
              </div>
            </SectionCard>

            {/* Mermaid Flowchart Canvas */}
            <MermaidViewer
              chart={personalizedRoadmap.mermaidChart}
              title={personalizedRoadmap.title || "Personalized Roadmap"}
            />
          </div>
        ) : (
          <SectionCard className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Personalized Roadmap
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              {personalizedError ||
                "Take your career assessment to extract your tailored sequence from the master roadmaps."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {!user ? (
                <Link to="/login">
                  <Button>Login Now</Button>
                </Link>
              ) : (
                <Link to="/assessment">
                  <Button>Take Career Assessment</Button>
                </Link>
              )}
              <Button variant="secondary" onClick={() => setActiveTab("12th")}>
                Explore Master 12th
              </Button>
            </div>
          </SectionCard>
        )
      ) : (
        /* Master Roadmap Views (12th or 10th) with Clean One-Career Flow */
        <div className="w-full space-y-4">
          <RoadmapGraph
            nodes={activeGraph.nodes}
            edges={activeGraph.edges}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id}
            isClass10={activeTab === "10th"}
            title={activeTab === "10th" ? "Class 10 Master Roadmap" : "Class 12 Master Roadmap"}
          />
        </div>
      )}
    </div>
  );

  if (publicOnly) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 max-w-[96rem] mx-auto space-y-6">
        {content}
      </div>
    );
  }

  return content;
}
