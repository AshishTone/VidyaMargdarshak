const Assessment = require("../models/Assessment");
const RoadmapEdge = require("../models/RoadmapEdge");
const RoadmapNode = require("../models/RoadmapNode");
const { ApiError } = require("../utils/ApiError");
const { isProfileComplete } = require("../utils/profileCompletion");
const { buildRecommendation } = require("./recommendationService");

const pathCatalog = [
  {
    id: "science-btech-cse",
    title: "Science -> PCM -> B.Tech CSE",
    stream: "Science",
    classLevel: ["10", "12"],
    interests: ["math", "computers", "technology", "science"],
    careerGoals: ["software", "ai", "data", "technology", "engineer"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "science-stream",
        "science-pcm",
        "btech-cse",
        "tech-internship",
        "software-engineer",
        "senior-engineer",
        "tech-lead",
      ],
      "12": [
        "12th-science-pcm",
        "btech-cse",
        "tech-internship",
        "software-engineer",
        "senior-engineer",
        "tech-lead",
      ],
    },
    description:
      "Strong fit for students who enjoy mathematics, computers, structured problem solving, and long-term tech growth.",
  },
  {
    id: "science-bca-mca",
    title: "Science -> BCA -> MCA",
    stream: "Science",
    classLevel: ["10", "12"],
    interests: ["computers", "design", "technology"],
    careerGoals: ["software", "developer", "application", "technology"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "science-stream",
        "science-pcm",
        "bca",
        "mca",
        "software-engineer",
        "senior-engineer",
      ],
      "12": ["12th-science-pcm", "bca", "mca", "software-engineer", "senior-engineer"],
    },
    description:
      "A practical software pathway for students who want strong computing outcomes with flexible entry routes.",
  },
  {
    id: "commerce-bba-mba",
    title: "Commerce -> BBA -> MBA",
    stream: "Commerce",
    classLevel: ["10", "12"],
    interests: ["business", "finance", "leadership", "management"],
    careerGoals: ["business", "management", "marketing", "product"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "commerce-stream",
        "12th-commerce",
        "bba",
        "mba",
        "business-analyst",
        "product-manager",
      ],
      "12": ["12th-commerce", "bba", "mba", "business-analyst", "product-manager"],
    },
    description:
      "A leadership-oriented roadmap for students drawn to business operations, analytics, and management roles.",
  },
  {
    id: "commerce-ca",
    title: "Commerce -> CA",
    stream: "Commerce",
    classLevel: ["10", "12"],
    interests: ["finance", "accounting", "numbers"],
    careerGoals: ["accountant", "finance", "audit", "tax"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "commerce-stream",
        "12th-commerce",
        "chartered-accountancy",
        "chartered-accountant",
        "finance-manager",
      ],
      "12": ["12th-commerce", "chartered-accountancy", "chartered-accountant", "finance-manager"],
    },
    description:
      "Best for detail-oriented learners who enjoy accounting, audit, taxation, and financial decision making.",
  },
  {
    id: "arts-journalism",
    title: "Arts -> Journalism -> Media Careers",
    stream: "Arts",
    classLevel: ["10", "12"],
    interests: ["writing", "languages", "social", "communication"],
    careerGoals: ["journalism", "media", "writing", "communication"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "arts-stream",
        "12th-arts",
        "journalism",
        "journalist",
        "editor",
      ],
      "12": ["12th-arts", "journalism", "journalist", "editor"],
    },
    description:
      "A communication-driven track for students who like storytelling, public issues, and media work.",
  },
  {
    id: "arts-law-upsc",
    title: "Arts -> Law / UPSC",
    stream: "Arts",
    classLevel: ["10", "12"],
    interests: ["history", "social", "debate", "leadership"],
    careerGoals: ["law", "civil service", "policy", "government"],
    nodeIdsByClass: {
      "10": [
        "after-10th",
        "arts-stream",
        "12th-arts",
        "llb",
        "lawyer",
        "civil-services",
      ],
      "12": ["12th-arts", "llb", "lawyer", "civil-services"],
    },
    description:
      "Useful for students drawn to public service, legal reasoning, policy, and governance.",
  },
  {
    id: "science-pcb-mbbs",
    title: "Science -> PCB -> MBBS",
    stream: "Science",
    classLevel: ["10", "12"],
    interests: ["science", "biology", "research", "people"],
    careerGoals: ["doctor", "medicine", "health", "physician"],
    nodeIdsByClass: {
      "10": ["after-10th", "science-stream", "science-pcb", "mbbs", "doctor"],
      "12": ["science-pcb", "mbbs", "doctor"],
    },
    description: "The classic medicine path for PCB students who want to practice clinical care.",
  },
  {
    id: "science-barch",
    title: "Science -> PCM -> B.Arch",
    stream: "Science",
    classLevel: ["10", "12"],
    interests: ["design", "math", "creativity"],
    careerGoals: ["architect", "designer"],
    nodeIdsByClass: {
      "10": ["after-10th", "science-stream", "science-pcm", "barch", "architect"],
      "12": ["12th-science-pcm", "barch", "architect"],
    },
    description: "Designed for PCM students who blend mathematical precision with creative visual designing.",
  },
  {
    id: "vocational-design",
    title: "Open School -> Design & Animation",
    stream: "Vocational",
    classLevel: ["10", "12"],
    interests: ["design", "creativity", "hands-on"],
    careerGoals: ["designer", "uiux", "graphic"],
    nodeIdsByClass: {
      "10": ["after-10th", "open-school", "diploma-design", "uiux-designer"],
      "12": ["open-school", "diploma-design", "uiux-designer"],
    },
    description: "A vocational creative path for visual thinkers wanting to enter UI/UX and graphic design.",
  },
];

function normalizeTermList(values = []) {
  return values.map((value) => value.toLowerCase());
}

function scorePath(path, user, streamScores) {
  let score = streamScores[path.stream] || 50;
  const interests = normalizeTermList(user.interests);

  score += path.interests.reduce(
    (total, keyword) =>
      total + (interests.some((item) => item.includes(keyword)) ? 6 : 0),
    0
  );

  if (path.classLevel.includes(user.classLevel)) score += 5;

  return Math.min(Math.round(score), 99);
}

async function getRoadmapLookup() {
  const [nodes, edges] = await Promise.all([RoadmapNode.find(), RoadmapEdge.find()]);
  const nodeMap = new Map(nodes.map((node) => [node.nodeId, node]));

  return { nodes, edges, nodeMap };
}

function mapNodeForClient(node) {
  return {
    id: node.nodeId,
    label: node.label,
    category: node.category,
    depth: node.depth,
    stage: node.stage,
    summary: node.summary,
    duration: node.duration,
    fees: node.fees,
    requiredStream: node.requiredStream,
    entranceExams: node.entranceExams,
    skills: node.skills,
    careerOptions: node.careerOptions,
    visibleIn: node.visibleIn,
    position: node.position,
  };
}

async function getPublicRoadmap() {
  const { nodes, edges } = await getRoadmapLookup();

  return {
    rootNodeId: "after-10th",
    nodes: nodes
      .filter((node) => node.visibleIn.includes("public"))
      .map(mapNodeForClient),
    edges: edges
      .filter((edge) => edge.visibleIn.includes("public"))
      .map((edge) => ({
        id: edge.edgeId,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label,
      })),
  };
}

async function getPersonalizedRoadmap(user) {
  if (!isProfileComplete(user)) {
    throw new ApiError(
      409,
      "Complete your student profile to unlock the personalized roadmap."
    );
  }

  const latestAssessment = await Assessment.findOne({ userId: user._id }).sort({
    createdAt: -1,
  });

  if (!latestAssessment) {
    throw new ApiError(
      409,
      "Complete your assessment to unlock the personalized roadmap."
    );
  }

  const recommendation = buildRecommendation(latestAssessment.scoreProfile, user);
  const streamScores = recommendation.normalizedScores;
  const { nodeMap } = await getRoadmapLookup();

  const recommendedPaths = pathCatalog
    .map((path) => ({
      ...path,
      confidence: scorePath(path, user, streamScores),
    }))
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 3)
    .map((path) => {
      const nodeIds = path.nodeIdsByClass[user.classLevel] || path.nodeIdsByClass["12"];
      const nodes = nodeIds
        .map((nodeId, index) => {
          const sourceNode = nodeMap.get(nodeId);
          if (!sourceNode) return null;

          return {
            ...mapNodeForClient(sourceNode),
            position: {
              x: 300,
              y: 80 + (index + 1) * 150,
            },
          };
        })
        .filter(Boolean);

      const userNode = {
        id: "user-root",
        label: `You (${user.name})`,
        category: "stage",
        depth: 0,
        stage: "Student State",
        summary: `Starting point for ${user.name} based on your Class ${user.classLevel} profile.`,
        duration: "",
        fees: "",
        requiredStream: "",
        entranceExams: [],
        skills: user.strengths || [],
        careerOptions: [],
        position: {
          x: 300,
          y: 80,
        },
      };

      const pathNodes = [userNode, ...nodes];

      const edges = nodeIds.slice(0, -1).map((nodeId, index) => ({
        id: `${path.id}-${index}`,
        source: nodeIds[index],
        target: nodeIds[index + 1],
        label: "Next step",
      }));

      const userEdge = {
        id: `${path.id}-user-root`,
        source: "user-root",
        target: nodeIds[0],
        label: "Your path",
      };

      const pathEdges = [userEdge, ...edges];

      return {
        id: path.id,
        title: path.title,
        confidence: path.confidence,
        description: path.description,
        graph: { nodes: pathNodes, edges: pathEdges },
      };
    });

  return {
    activation: {
      profileCompleted: true,
      assessmentCompleted: true,
    },
    topStream: recommendation.rankedStreams[0],
    recommendedPaths,
  };
}

module.exports = { getPublicRoadmap, getPersonalizedRoadmap };
