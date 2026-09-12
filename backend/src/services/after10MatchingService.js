const categoryToPathway = [
  { pathway: "11th–12th Science", categoryId: "SCIENCE_ENGINEERING_TECH", academicSubjects: ["mathematics", "science"], preferenceValues: ["MATHEMATICS", "SCIENCE", "PROBLEM_SOLVING", "TECHNICAL", "SCIENTIFIC", "COMPUTERS_THINGS"] },
  { pathway: "Polytechnic Diploma", categoryId: "SCIENCE_ENGINEERING_TECH", academicSubjects: ["mathematics", "science"], preferenceValues: ["PRACTICAL", "BUILDING", "MACHINES_TOOLS", "TECHNICAL", "PRACTICAL"] },
  { pathway: "11th–12th Commerce", categoryId: "COMMERCE_FINANCE_BUSINESS", academicSubjects: ["mathematics", "english"], preferenceValues: ["NUMBERS_DATA", "BUSINESS_MONEY", "MONEY_BUSINESS", "ORGANIZING_LEADING"] },
  { pathway: "11th–12th Arts", categoryId: "SOCIAL_SCIENCE_HUMANITIES", academicSubjects: ["english", "socialScience"], preferenceValues: ["COMMUNICATING", "CREATING_DESIGNING", "CREATIVE", "DISCUSSING"] },
  { pathway: "ITI / Skill-based Courses", categoryId: "AGRICULTURE_ALLIED", academicSubjects: [], preferenceValues: ["PRACTICAL", "MACHINES_TOOLS", "NATURE", "BUILDING"] },
];

const average = values => values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
function preferenceFit(profile, values) {
  const answers = Object.values(profile).flat().filter(Boolean);
  if (!answers.length) return 50;
  return Math.min(100, 40 + (answers.filter(answer => values.includes(answer)).length / Math.max(1, values.length)) * 60);
}
function academicFit(user, subjects) {
  if (user.resultStatus === "NOT_DECLARED" || user.tenthOverallPercentage == null) return null;
  const subjectScores = subjects.map(subject => user.subjectMarks?.[subject]).filter(Number.isFinite);
  return average([user.tenthOverallPercentage, ...(subjectScores.length ? [average(subjectScores)] : [])]);
}
function buildStructuredRecommendations({ user, interestResult, profile }) {
  const interestScores = new Map((interestResult.results || []).map(item => [item.categoryId, item.interestIndex]));
  const marksDeclared = user.resultStatus !== "NOT_DECLARED" && user.tenthOverallPercentage != null;
  const recommendations = categoryToPathway.map(rule => {
    const interestFit = interestScores.get(rule.categoryId) || 0;
    const preference = preferenceFit(profile, rule.preferenceValues);
    const academic = academicFit(user, rule.academicSubjects);
    const matchScore = marksDeclared
      ? interestFit * 0.5 + academic * 0.3 + preference * 0.2
      : (interestFit * 0.5 + preference * 0.2) / 0.7;
    return { pathway: rule.pathway, matchScore: Number(matchScore.toFixed(1)), interestFit: Number(interestFit.toFixed(1)), preferenceFit: Number(preference.toFixed(1)), academicFit: academic == null ? "UNAVAILABLE" : Number(academic.toFixed(1)), eligibility: "REVIEW_REQUIRED" };
  }).sort((left, right) => right.matchScore - left.matchScore);
  return { student: { marksDeclared, overallPercentage: marksDeclared ? user.tenthOverallPercentage : null, subjects: user.subjectMarks || {} }, interestProfile: (interestResult.results || []).map(item => ({ category: item.categoryId, score: item.interestIndex, uncertainty: item.uncertaintyRate })), learningProfile: profile, recommendations };
}
module.exports = { buildStructuredRecommendations };
