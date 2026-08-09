import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import RoadmapGraph from "../components/roadmap/RoadmapGraph";
import useAuth from "../hooks/useAuth";
import {
  fetchPersonalizedRoadmap,
  fetchPublicRoadmap,
} from "../services/platformService";

export default function RoadmapsPage({ publicOnly = false }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("public");
  const [publicRoadmap, setPublicRoadmap] = useState(null);
  const [personalizedRoadmap, setPersonalizedRoadmap] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [personalizedError, setPersonalizedError] = useState("");

  useEffect(() => {
    fetchPublicRoadmap().then((data) => {
      setPublicRoadmap(data);
      setSelectedNode(data.nodes?.[0] || null);
    });
  }, []);

  useEffect(() => {
    if (!user || publicOnly) return;

    fetchPersonalizedRoadmap()
      .then((data) => {
        setPersonalizedRoadmap(data);
        setSelectedPathId(data.recommendedPaths?.[0]?.id || "");
      })
      .catch((error) => {
        setPersonalizedError(
          error.response?.data?.message ||
            "Complete your profile and assessment to unlock the personalized roadmap."
        );
      });
  }, [publicOnly, user]);

  const currentPersonalizedPath = useMemo(
    () =>
      personalizedRoadmap?.recommendedPaths?.find((path) => path.id === selectedPathId) ||
      personalizedRoadmap?.recommendedPaths?.[0],
    [personalizedRoadmap, selectedPathId]
  );

  const graphData =
    activeTab === "personalized" && currentPersonalizedPath
      ? currentPersonalizedPath.graph
      : publicRoadmap;

  return (
    <div className="space-y-6">
      <SectionCard className="overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#60a5fa_100%)] text-white">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Roadmap Graph</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Explore education pathways as a real knowledge graph.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">
              Use the public roadmap to explore all possible routes after 10th and 12th. Once
              your profile and assessment are complete, unlock a personalized roadmap with
              confidence-based path recommendations.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-semibold text-blue-100">Modes</p>
            <p className="mt-3 text-2xl font-bold">Public + Personalized</p>
            <p className="mt-3 text-sm text-blue-100">
              Public works without login. Personalized activates only after onboarding and assessment completion.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="flex flex-wrap items-center gap-3">
        <Button
          variant={activeTab === "public" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("public");
            if (publicRoadmap?.nodes?.length) setSelectedNode(publicRoadmap.nodes[0]);
          }}
        >
          Public Roadmap
        </Button>
        {!publicOnly ? (
          <Button
            variant={activeTab === "personalized" ? "primary" : "secondary"}
            onClick={() => {
              setActiveTab("personalized");
              if (currentPersonalizedPath?.graph?.nodes?.length) {
                setSelectedNode(currentPersonalizedPath.graph.nodes[0]);
              }
            }}
          >
            Personalized Roadmap
          </Button>
        ) : null}
        {!user ? (
          <Link to="/login" className="text-sm font-semibold text-blue-800">
            Login to unlock personalized pathing
          </Link>
        ) : null}
      </SectionCard>

      {!publicOnly && activeTab === "personalized" ? (
        user && personalizedRoadmap?.recommendedPaths?.length ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {personalizedRoadmap.recommendedPaths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => {
                      setSelectedPathId(path.id);
                      setSelectedNode(path.graph.nodes[0]);
                    }}
                    className={`panel rounded-[1.8rem] p-5 text-left transition ${
                      currentPersonalizedPath?.id === path.id
                        ? "ring-2 ring-blue-500"
                        : "hover:-translate-y-1"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">
                      Recommended Path
                    </p>
                    <h2 className="mt-3 text-xl font-bold text-slate-950">{path.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{path.description}</p>
                    <p className="mt-4 text-sm font-semibold text-emerald-700">
                      Confidence: {path.confidence}%
                    </p>
                  </button>
                ))}
              </div>

              {graphData ? (
                <RoadmapGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  onSelectNode={setSelectedNode}
                />
              ) : null}
            </div>

            <SectionCard>
              <p className="section-title">Node Information</p>
              {selectedNode ? (
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{selectedNode.label}</p>
                  </div>
                  {selectedNode.summary ? <p>{selectedNode.summary}</p> : null}
                  {selectedNode.duration ? <p>Duration: {selectedNode.duration}</p> : null}
                  {selectedNode.fees ? <p>Fees: {selectedNode.fees}</p> : null}
                  {selectedNode.requiredStream ? <p>Required stream: {selectedNode.requiredStream}</p> : null}
                  {selectedNode.entranceExams?.length ? (
                    <p>Entrance exams: {selectedNode.entranceExams.join(", ")}</p>
                  ) : null}
                  {selectedNode.skills?.length ? <p>Skills: {selectedNode.skills.join(", ")}</p> : null}
                  {selectedNode.careerOptions?.length ? (
                    <p>Career options: {selectedNode.careerOptions.join(", ")}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Select a node to inspect its details.</p>
              )}
            </SectionCard>
          </div>
        ) : (
          <SectionCard>
            <p className="section-title">Personalized roadmap locked</p>
            <p className="mt-3 text-sm text-slate-600">
              {personalizedError ||
                "Complete your student profile and assessment to generate a confidence-based roadmap."}
            </p>
            {!user ? (
              <Link to="/login" className="mt-5 inline-flex">
                <Button>Login</Button>
              </Link>
            ) : personalizedError.toLowerCase().includes("assessment") ? (
              <Link to="/assessment" className="mt-5 inline-flex">
                <Button>Take assessment</Button>
              </Link>
            ) : (
              <Link to="/profile" className="mt-5 inline-flex">
                <Button>Complete profile</Button>
              </Link>
            )}
          </SectionCard>
        )
      ) : publicRoadmap ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <RoadmapGraph
            nodes={publicRoadmap.nodes}
            edges={publicRoadmap.edges}
            rootNodeId={publicRoadmap.rootNodeId}
            interactive
            onSelectNode={setSelectedNode}
          />

          <SectionCard>
            <p className="section-title">Node Information</p>
            {selectedNode ? (
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedNode.label}</p>
                </div>
                {selectedNode.summary ? <p>{selectedNode.summary}</p> : null}
                {selectedNode.duration ? <p>Duration: {selectedNode.duration}</p> : null}
                {selectedNode.fees ? <p>Fees: {selectedNode.fees}</p> : null}
                {selectedNode.requiredStream ? <p>Required stream: {selectedNode.requiredStream}</p> : null}
                {selectedNode.entranceExams?.length ? (
                  <p>Entrance exams: {selectedNode.entranceExams.join(", ")}</p>
                ) : null}
                {selectedNode.skills?.length ? <p>Skills: {selectedNode.skills.join(", ")}</p> : null}
                {selectedNode.careerOptions?.length ? (
                  <p>Career options: {selectedNode.careerOptions.join(", ")}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Click a node to inspect details and expand the public graph.
              </p>
            )}
          </SectionCard>
        </div>
      ) : (
        <SectionCard>Loading roadmap graph...</SectionCard>
      )}
    </div>
  );
}
