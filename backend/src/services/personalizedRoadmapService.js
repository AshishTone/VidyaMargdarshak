const RoadmapNode = require("../models/RoadmapNode");
const { ApiError } = require("../utils/ApiError");
const courseCatalog = require("../data/after12CourseCatalog");

const routeDefinitions = {
  "11th–12th Science": ["after-10th", "science-stream", "12th-science-pcm", "btech-cse"],
  "Polytechnic Diploma": ["after-10th", "polytechnic", "civil-engineer"],
  "11th–12th Commerce": ["after-10th", "commerce-stream", "12th-commerce", "bcom"],
  "11th–12th Arts": ["after-10th", "arts-stream", "12th-arts", "ba"],
  "ITI / Skill-based Courses": ["after-10th", "iti", "open-school", "diploma-design"],
};
const matchLevel = score => score >= 75 ? "Strong Match" : score >= 55 ? "Good Match" : "Explore";

function validateRoadmap(roadmap, selected) {
  if (roadmap.pathways.length !== 2) throw new ApiError(500, "Roadmap must contain exactly two pathways.");
  if (roadmap.pathways.some((path, index) => path.pathwayName !== selected[index].pathway || path.matchScore !== selected[index].matchScore)) throw new ApiError(500, "Roadmap pathway validation failed.");
  const ids = new Set([roadmap.currentStage.id]);
  roadmap.pathways.forEach(path => path.nodes.forEach(node => ids.add(node.id)));
  if (roadmap.pathways.some(path => path.edges.some(edge => !ids.has(edge.from) || !ids.has(edge.to)))) throw new ApiError(500, "Roadmap edge validation failed.");
}

async function buildRoadmap({ result, structuredRecommendations, aiExplanation, marksDeclared }) {
  const selected = structuredRecommendations.recommendations.slice(0, 2);
  if (selected.length < 2) throw new ApiError(409, "At least two recommended pathways are needed to build a roadmap.");
  const nodeIds = [...new Set(selected.flatMap(item => routeDefinitions[item.pathway] || ["after-10th"]))];
  const verifiedNodes = await RoadmapNode.find({ nodeId: { $in: nodeIds } }).lean();
  const nodeMap = new Map(verifiedNodes.map(node => [node.nodeId, node]));
  const aiByPathway = new Map((aiExplanation?.recommendations || []).map(item => [item.pathway, item]));
  const pathways = selected.map((recommendation, index) => {
    const route = (routeDefinitions[recommendation.pathway] || ["after-10th"]).filter(id => nodeMap.has(id));
    const nodes = route.slice(1).map((id, nodeIndex) => {
      const source = nodeMap.get(id);
      return { id: `${index}-${id}`, sourceId: id, type: nodeIndex === 0 ? "NEXT_STEP" : nodeIndex === route.length - 2 ? "HIGHER_EDUCATION" : "SPECIALIZATION", title: source.label, description: source.summary || "Verified pathway information.", duration: source.duration || "" };
    });
    const edges = nodes.map((node, nodeIndex) => ({ from: nodeIndex ? nodes[nodeIndex - 1].id : "after10", to: node.id }));
    const ai = aiByPathway.get(recommendation.pathway);
    return { rank: index + 1, pathwayName: recommendation.pathway, matchScore: recommendation.matchScore, matchLevel: matchLevel(recommendation.matchScore), whyItMatches: ai?.why || `Your interest and learning-preference results support exploring ${recommendation.pathway}.`, nodes, edges, nextSteps: ai?.nextSteps || ["Review verified eligibility and admission information.", "Explore the subjects and learning route involved."] };
  });
  const roadmap = { schemaVersion: "ROADMAP_V1", generatedAt: new Date(), title: "Your Personalized Roadmap", intro: marksDeclared ? "This roadmap combines your assessment results with verified pathway data." : "Your 10th-standard results are not available yet. This roadmap is based on your interests and learning preferences and can be refined once marks are available.", currentStage: { id: "after10", title: "10th Standard", description: "You are choosing your next educational pathway." }, pathways, explorationNote: result.results.filter(item => item.uncertaintyRate >= 30).map(item => item.categoryId), disclaimer: "This roadmap provides educational guidance based on your current assessment profile. It does not guarantee a particular career outcome." };
  validateRoadmap(roadmap, selected);
  return roadmap;
}

function readableDomain(domain) {
  return domain.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

function buildAfter12Roadmap({ result, structuredRecommendations, aiExplanation }) {
  const selected = structuredRecommendations.recommendations.slice(0, 2);
  if (selected.length < 2) throw new ApiError(409, "At least two eligible course recommendations are needed to build a roadmap.");
  const aiByPathway = new Map((aiExplanation?.recommendations || []).map(item => [item.pathway, item]));
  const pathways = selected.map((recommendation, index) => {
    const course = courseCatalog.find(item => item.id === recommendation.courseId);
    const domainNames = Object.keys(course?.domains || {}).slice(0, 2).map(readableDomain).join(" and ");
    const requiredSubjects = Object.keys(course?.required || {}).map(subject => subject[0].toUpperCase() + subject.slice(1)).join(", ");
    const ai = aiByPathway.get(recommendation.pathway);
    const nodes = [
      { id: `${index}-course`, type: "NEXT_STEP", title: recommendation.pathway, description: `Review eligibility, entrance examinations, fees, and approved colleges for ${recommendation.pathway}.` },
      { id: `${index}-preparation`, type: "SPECIALIZATION", title: "Prepare for admission", description: `Strengthen ${requiredSubjects || "the required subjects"} and plan for the relevant entrance or admission process.` },
      { id: `${index}-explore`, type: "HIGHER_EDUCATION", title: "Explore course outcomes", description: `Compare specializations, practical learning opportunities, higher studies, and careers connected to ${recommendation.pathway}.` },
    ];
    return { rank: index + 1, pathwayName: recommendation.pathway, matchScore: recommendation.matchScore, matchLevel: matchLevel(recommendation.matchScore), whyItMatches: ai?.why || `This course is eligible for your ${structuredRecommendations.stream} stream and aligns with your measured interest in ${domainNames || "the relevant domains"}, academic marks, and available preferences.`, nodes, edges: nodes.map((node, nodeIndex) => ({ from: nodeIndex ? nodes[nodeIndex - 1].id : "after12", to: node.id })), nextSteps: ai?.nextSteps || [`Verify the current eligibility and entrance requirements for ${recommendation.pathway}.`, "Compare approved colleges, curriculum, cost, and location options.", "Discuss your shortlist with a teacher, parent, or qualified counsellor before applying."] };
  });
  return { schemaVersion: "AFTER12_ROADMAP_V1", generatedAt: new Date(), title: "Your Personalized Roadmap", intro: `This ${structuredRecommendations.stream} roadmap uses your deterministic interest scores, Class-12 academic information, and course eligibility. It is guidance for exploration, not a guarantee of admission or a career outcome.`, currentStage: { id: "after12", title: `12th Standard · ${structuredRecommendations.stream}`, description: "You are planning your higher-education options after Class 12." }, pathways, explorationNote: result.results.filter(item => item.uncertaintyRate >= 30).map(item => readableDomain(item.categoryId)), disclaimer: "Always verify current admission eligibility, entrance requirements, and college information from official sources before applying." };
}
module.exports = { buildRoadmap, buildAfter12Roadmap };
