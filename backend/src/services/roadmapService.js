const Assessment = require("../models/Assessment");
const CareerRoadmap10th = require("../models/CareerRoadmap10th");
const CareerRoadmap12th = require("../models/CareerRoadmap12th");
const { ApiError } = require("../utils/ApiError");
const { isProfileComplete } = require("../utils/profileCompletion");
const { buildRecommendation } = require("./recommendationService");

// Auto-layout algorithm to calculate crisp, clean, non-overlapping coordinates
function layoutGraphNodes(nodes = [], edges = [], isClass10 = false) {
  if (!nodes.length) return nodes;

  // Build connectivity maps
  const outgoing = new Map();
  const incoming = new Map();
  nodes.forEach((n) => {
    outgoing.set(n.id, []);
    incoming.set(n.id, []);
  });
  edges.forEach((e) => {
    if (outgoing.has(e.source)) outgoing.get(e.source).push(e.target);
    if (incoming.has(e.target)) incoming.get(e.target).push(e.source);
  });

  // Assign columns/stages based on node types and logical progression
  function getNodeStage(node) {
    const id = node.id.toLowerCase();
    const type = (node.type || "").toLowerCase();
    const level = (node.data?.level || "").toLowerCase();

    // Column 0: Root starting point
    if (type === "root" || id.startsWith("root_") || id === "user-root") return 0;

    // Column 1: Stream gateways & broad 10th pathways
    if (type === "stream" || id.startsWith("stream_") || id.startsWith("a001_") || id.startsWith("a002_") || id.startsWith("a003_")) {
      return 1;
    }
    if (isClass10 && (id === "a004_diploma" || id === "a005_iti" || id === "v002_pmkvy" || id === "v003_nielit")) {
      return 1;
    }

    // Column 2: Entrance Exams (12th) OR Diploma/ITI trades & specializations (10th)
    if (id.startsWith("exam_") || type === "pathway" && !id.startsWith("a00")) {
      return 2;
    }
    if (isClass10 && (id.startsWith("dp_") || id.startsWith("iti_") || id === "skill_training" || id === "apprenticeship")) {
      return 2;
    }

    // Column 3: Undergraduate Courses & Lateral Entry & Direct Skilled Employment
    if (id.startsWith("c_") || id === "btech_lateral" || id === "diploma_employment" || id === "iti_employment" || id === "skill_worker" || id === "nielit_it") {
      return 3;
    }

    // Column 4: Professional Certifications & Postgraduate Degrees
    if (id.startsWith("p_") || id.startsWith("pg_")) {
      return 4;
    }

    // Column 5: Super-Specializations (DM, MCh) & Doctoral / Deep Research
    if (id.startsWith("dr_") || id === "research_phd" || id.includes("_dm") || id.includes("_mch")) {
      return 5;
    }

    // Column 6: Career Groups / Domains
    if (type === "career_group" || id.startsWith("cg_")) {
      return 6;
    }

    // Column 7: Specific Careers
    if (type === "career" || id.startsWith("career_") || id === "diploma_je") {
      return 7;
    }

    // Column 8: Government, Civil Services, PSUs & Entrepreneurship
    if (type === "government" || id.startsWith("gov_") || id === "diploma_gov" || id === "iti_gov" || id === "entrepreneurship") {
      return 8;
    }

    return 3;
  }

  // Group nodes by stage
  const columns = {};
  nodes.forEach((node) => {
    const stage = getNodeStage(node);
    if (!columns[stage]) columns[stage] = [];
    columns[stage].push(node);
  });

  // Assign stream weights to sort vertically and avoid tangled edges
  function getStreamWeight(node) {
    const id = node.id.toLowerCase();
    const label = (node.data?.label || "").toLowerCase();
    const stream = (node.data?.stream || "").toLowerCase();

    if (stream.includes("pcm") || id.includes("pcm") || id.includes("btech") || id.includes("cs") || id.includes("tech") || id.includes("eng") || id.includes("civil") || id.includes("mech") || id.includes("elec")) return 1;
    if (stream.includes("pcb") || id.includes("pcb") || id.includes("mbbs") || id.includes("bds") || id.includes("ayur") || id.includes("homeo") || id.includes("health") || id.includes("med") || id.includes("nurs") || id.includes("pharm")) return 2;
    if (stream.includes("pcmb") || id.includes("pcmb") || id.includes("biotech") || id.includes("agri")) return 3;
    if (stream.includes("commerce") || id.includes("com") || id.includes("bba") || id.includes("bms") || id.includes("ca") || id.includes("cs") || id.includes("cma") || id.includes("fin") || id.includes("actuar")) return 4;
    if (stream.includes("arts") || id.includes("arts") || id.includes("ba") || id.includes("law") || id.includes("bjmc") || id.includes("des") || id.includes("fa") || id.includes("soc") || id.includes("hm")) return 5;
    if (id.includes("iti") || id.includes("diploma") || id.includes("skill") || id.includes("pmkvy") || id.includes("nielit")) return 6;
    if (id.includes("gov") || id.includes("upsc") || id.includes("ssc") || id.includes("bank") || id.includes("rail")) return 7;
    return 8;
  }

  const columnWidth = 380;
  const nodeHeight = 130;

  const positionedNodes = nodes.map((node) => {
    const stage = getNodeStage(node);
    const colNodes = columns[stage] || [node];

    // Sort column nodes by stream weight and then by label
    colNodes.sort((a, b) => {
      const weightDiff = getStreamWeight(a) - getStreamWeight(b);
      if (weightDiff !== 0) return weightDiff;
      return (a.data?.label || a.id).localeCompare(b.data?.label || b.id);
    });

    const index = colNodes.findIndex((n) => n.id === node.id);
    const totalInCol = colNodes.length;
    const startY = -((totalInCol - 1) * nodeHeight) / 2;

    return {
      ...node,
      position: {
        x: stage * columnWidth + 80,
        y: Math.round(startY + index * nodeHeight + 400),
      },
      data: {
        ...node.data,
        stageIndex: stage,
      },
    };
  });

  return positionedNodes;
}

// Enhance edges with smooth styles and animations
function formatEdges(edges = []) {
  return edges.map((edge) => {
    const relation = edge.data?.relation || "";
    let strokeColor = "#3b82f6"; // default blue
    let animated = false;

    if (relation === "pathway" || relation === "after_10th_choice") {
      strokeColor = "#2563eb";
      animated = true;
    } else if (relation === "entrance_route" || relation === "entrance_to_course") {
      strokeColor = "#f59e0b"; // amber
      animated = true;
    } else if (relation === "career_outcome" || relation === "employment" || relation === "career_specialization") {
      strokeColor = "#10b981"; // emerald
      animated = false;
    } else if (relation === "government_opportunity" || relation === "technical_government_opportunity") {
      strokeColor = "#8b5cf6"; // purple
      animated = false;
    } else if (relation === "higher_study" || relation === "medical_higher_study" || relation === "super_specialization" || relation === "doctoral_progression") {
      strokeColor = "#06b6d4"; // cyan
      animated = true;
    } else if (relation === "lateral_entry" || relation === "specialization" || relation === "trade") {
      strokeColor = "#6366f1"; // indigo
    }

    return {
      ...edge,
      type: "smoothstep",
      animated,
      style: {
        stroke: strokeColor,
        strokeWidth: 2,
      },
      data: {
        ...edge.data,
        relationLabel: relation.replaceAll("_", " "),
      },
    };
  });
}

// Fetch Master Roadmap for Class 10
async function getRoadmap10th() {
  const doc = await CareerRoadmap10th.findOne({ "metadata.graphId": "VIDYAMARGDARSHAK_AFTER10TH_MASTER_ROADMAP" });
  if (!doc) {
    throw new ApiError(404, "Class 10 master roadmap not found in MongoDB.");
  }

  const rawObj = doc.toObject();
  const nodesWithPositions = layoutGraphNodes(rawObj.nodes, rawObj.edges, true);
  const styledEdges = formatEdges(rawObj.edges);

  return {
    metadata: rawObj.metadata,
    nodes: nodesWithPositions,
    edges: styledEdges,
  };
}

// Fetch Master Roadmap for Class 12
async function getRoadmap12th() {
  const doc = await CareerRoadmap12th.findOne({ "metadata.graphId": "VIDYAMARGDARSHAK_AFTER12TH_MASTER_ROADMAP" });
  if (!doc) {
    throw new ApiError(404, "Class 12 master roadmap not found in MongoDB.");
  }

  const rawObj = doc.toObject();
  const nodesWithPositions = layoutGraphNodes(rawObj.nodes, rawObj.edges, false);
  const styledEdges = formatEdges(rawObj.edges);

  return {
    metadata: rawObj.metadata,
    nodes: nodesWithPositions,
    edges: styledEdges,
  };
}

// Public roadmap handler (defaults to 12th or supports ?level=10)
async function getPublicRoadmap(level = "12") {
  if (level === "10") {
    return getRoadmap10th();
  }
  return getRoadmap12th();
}

const AssessmentAttempt = require("../models/AssessmentAttempt");
const AssessmentResponse = require("../models/AssessmentResponse");
const InterestResult = require("../models/InterestResult");
const PersonalizedRoadmapGraph = require("../models/PersonalizedRoadmapGraph");
const { generatePersonalizedRoadmapWithLLM } = require("./geminiRoadmapService");
const { buildStructuredRecommendations } = require("./after10MatchingService");
const { buildAfter12Recommendations } = require("./after12RecommendationService");

// Personalized Roadmap: Generated by LLM as detailed Mermaid flowchart & cached in MongoDB
async function getPersonalizedRoadmap(user) {
  if (!user || !user._id) {
    throw new ApiError(401, "Please log in to view your personalized roadmap.");
  }

  // 1. Check if roadmap was already generated and saved in MongoDB
  const cachedGraphDoc = await PersonalizedRoadmapGraph.findOne({
    userId: user._id,
  }).lean();

  if (cachedGraphDoc?.mermaidChart) {
    console.log(`[PersonalizedRoadmap] Loaded Mermaid chart from MongoDB cache for: ${user.name}`);
    return {
      source: "mongodb_cache",
      studentInfo: {
        name: user.name,
        classLevel: user.classLevel || "12",
        topStream: user.twelfthStream || user.stream || "Science",
      },
      title: cachedGraphDoc.title || `Personalized Career Roadmap for ${user.name}`,
      summary: cachedGraphDoc.summary || "",
      topInterests: cachedGraphDoc.topInterests || [],
      topCourses: cachedGraphDoc.topCourses || [],
      mermaidChart: cachedGraphDoc.mermaidChart,
      generatedAt: cachedGraphDoc.generatedAt,
    };
  }

  // 2. Fetch student's assessment result in strictly read-only mode (.lean())
  const [interestResult, assessmentAttempt, responses] = await Promise.all([
    InterestResult.findOne({ studentId: user._id }).sort({ createdAt: -1 }).lean(),
    AssessmentAttempt.findOne({ studentId: user._id, status: "COMPLETED" })
      .sort({ completedAt: -1, createdAt: -1 })
      .lean(),
    AssessmentResponse.find({
      studentId: user._id,
      responseType: "PROFILE",
    }).lean(),
  ]);

  const assessmentData = { ...(interestResult || {}) };

  // Ensure structured recommendations (top recommended courses in India) are available
  if (
    !assessmentData.structuredRecommendations?.recommendations?.length &&
    assessmentData.results?.length > 0
  ) {
    try {
      const isAfter12 = user.classLevel === "12";
      const profile = Object.fromEntries(
        (responses || []).map((x) => [
          String(x.questionId).replace(/^PROFILE:/, ""),
          x.responseValues,
        ])
      );
      if (isAfter12) {
        assessmentData.structuredRecommendations = buildAfter12Recommendations({
          user,
          result: assessmentData,
          profile,
        });
      } else {
        assessmentData.structuredRecommendations = buildStructuredRecommendations({
          user,
          interestResult: assessmentData,
          profile,
        });
      }
    } catch (e) {
      console.warn("[PersonalizedRoadmap] Could not compute structured recommendations:", e.message);
    }
  }

  // 3. Call LLM to generate the personalized Mermaid flowchart based on Top 3 Recommended Courses
  console.log(`[PersonalizedRoadmap] Generating new Mermaid flowchart with LLM for: ${user.name}`);
  let generatedResult;
  try {
    generatedResult = await generatePersonalizedRoadmapWithLLM(assessmentData, user);
  } catch (err) {
    console.error("[PersonalizedRoadmap] LLM call failed:", err.message);
    throw new ApiError(500, `Failed to generate personalized roadmap: ${err.message}`);
  }

  // 4. Save generated Mermaid chart to MongoDB to eliminate future LLM calls
  await PersonalizedRoadmapGraph.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      attemptId: assessmentAttempt?._id,
      title: generatedResult.title || `Personalized Career Roadmap for ${user.name}`,
      summary: generatedResult.summary || "",
      topInterests: generatedResult.topInterests || [],
      topCourses: generatedResult.topCourses || [],
      mermaidChart: generatedResult.mermaidChart,
      generatedBy: "gemini-2.5-flash",
      generatedAt: new Date(),
    },
    { upsert: true, returnDocument: "after" }
  );
  console.log(`[PersonalizedRoadmap] Saved generated Mermaid chart to MongoDB for: ${user.name}`);

  return {
    source: "llm_generated",
    studentInfo: {
      name: user.name,
      classLevel: user.classLevel || "12",
      topStream: user.twelfthStream || user.stream || "Science",
    },
    title: generatedResult.title || `Personalized Career Roadmap for ${user.name}`,
    summary: generatedResult.summary || "",
    topInterests: generatedResult.topInterests || [],
    topCourses: generatedResult.topCourses || [],
    mermaidChart: generatedResult.mermaidChart,
    generatedAt: new Date(),
  };
}

module.exports = {
  getRoadmap10th,
  getRoadmap12th,
  getPublicRoadmap,
  getPersonalizedRoadmap,
};
