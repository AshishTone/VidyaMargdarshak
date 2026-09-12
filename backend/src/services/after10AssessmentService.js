const labels = {
  DEFENCE_SECURITY: "Defence & Security", AGRICULTURE_ALLIED: "Agriculture & Allied",
  SOCIAL_SCIENCE_HUMANITIES: "Social Science & Humanities", ARTS_MEDIA_CREATIVE: "Arts, Media & Creative",
  MEDICAL_HEALTH: "Medical & Health", COMMERCE_FINANCE_BUSINESS: "Commerce, Finance & Business",
  SCIENCE_ENGINEERING_TECH: "Science, Engineering & Technology",
};
function labelFor(category) { return labels[category] || category; }
function preferenceProfile(responses) { return Object.fromEntries(responses.map(({ questionId, values }) => [questionId, values.length === 1 ? values[0] : values])); }
function pathways(profile, preferences) {
  const score = category => profile.find(item => item.category === category)?.interestScore || 0;
  const strong = (values, item) => Array.isArray(values) && values.includes(item);
  const result = [];
  if (score("SCIENCE_ENGINEERING_TECH") >= 50) result.push({ name: "11th–12th Science", match: score("SCIENCE_ENGINEERING_TECH") >= 65 ? "Strong Match" : "Potential Match", explanation: `Science & Engineering interest is ${score("SCIENCE_ENGINEERING_TECH").toFixed(1)}/100${strong(preferences["1"], "MATHEMATICS") || strong(preferences["1"], "SCIENCE") ? "; Mathematics or Science is a reported strength" : ""}.` });
  if (score("COMMERCE_FINANCE_BUSINESS") >= 50) result.push({ name: "11th–12th Commerce", match: "Potential Match", explanation: `Commerce, Finance & Business interest is ${score("COMMERCE_FINANCE_BUSINESS").toFixed(1)}/100.` });
  if (score("SOCIAL_SCIENCE_HUMANITIES") >= 50 || score("ARTS_MEDIA_CREATIVE") >= 50) result.push({ name: "11th–12th Arts", match: "Potential Match", explanation: "Your humanities or creative interests support exploring Arts pathways." });
  result.push({ name: "ITI / Vocational & Skill-based Courses", match: "Explore", explanation: "Consider this pathway when hands-on learning and job-focused skills appeal to you." });
  return result.slice(0, 4);
}
module.exports = { labelFor, preferenceProfile, pathways };
