const RoadmapNode = require("../models/RoadmapNode");
const { ApiError } = require("../utils/ApiError");

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
module.exports = { buildRoadmap };
