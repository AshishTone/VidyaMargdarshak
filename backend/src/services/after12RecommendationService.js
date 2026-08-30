const catalog = require("../data/after12CourseCatalog");

const weightedAverage = (values) => {
  const weight = values.reduce((total, item) => total + item.weight, 0);
  return weight ? values.reduce((total, item) => total + item.value * item.weight, 0) / weight : null;
};

function buildAfter12Recommendations({ user, result, profile = {} }) {
  const stream = user.twelfthStream;
  const scores = new Map((result.results || []).map(item => [item.categoryId, item.interestIndex]));
  const marks = user.twelfthSubjectMarks || {};
  const selectedSignals = Object.values(profile).flat().filter(Boolean);
  const recommendations = catalog.filter(course => course.streams.includes(stream)).map(course => {
    const academicValues = Object.entries(course.required).map(([subject, weight]) => ({ value: Number(marks[subject]), weight })).filter(item => Number.isFinite(item.value));
    const eligible = academicValues.length === Object.keys(course.required).length;
    if (!eligible) return null;
    const interestFit = weightedAverage(Object.entries(course.domains).map(([domain, weight]) => ({ value: scores.get(domain) || 0, weight })));
    const academicFit = weightedAverage(academicValues);
    const applicableSignals = course.signals || [];
    const preferenceFit = selectedSignals.length && applicableSignals.length
      ? (selectedSignals.filter(signal => applicableSignals.includes(signal)).length / applicableSignals.length) * 100
      : 50;
    const matchScore = interestFit * 0.55 + academicFit * 0.25 + preferenceFit * 0.2;
    return { courseId: course.id, pathway: course.name, eligibility: "ELIGIBLE", interestFit: Number(interestFit.toFixed(1)), academicFit: Number(academicFit.toFixed(1)), preferenceFit: Number(preferenceFit.toFixed(1)), matchScore: Number(matchScore.toFixed(1)) };
  }).filter(Boolean).sort((left, right) => right.matchScore - left.matchScore);
  return { assessmentType: "AFTER12", stream, student: { marksDeclared: Boolean(user.twelfthOverallPercentage != null), overallPercentage: user.twelfthOverallPercentage ?? null, subjects: marks }, interestProfile: (result.results || []).map(item => ({ category: item.categoryId, score: item.interestIndex, uncertainty: item.uncertaintyRate })), learningProfile: profile, recommendations };
}

module.exports = { buildAfter12Recommendations };
