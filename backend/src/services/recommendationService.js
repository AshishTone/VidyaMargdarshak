const STREAM_ORDER = ["Science", "Commerce", "Arts", "Vocational"];

const interestRules = [
  {
    matchers: ["math", "computers", "technology", "research", "problem solving"],
    stream: "Science",
    points: 12,
  },
  {
    matchers: ["business", "finance", "accounting", "entrepreneurship"],
    stream: "Commerce",
    points: 12,
  },
  {
    matchers: ["writing", "languages", "history", "social studies", "psychology"],
    stream: "Arts",
    points: 12,
  },
  {
    matchers: ["hands-on", "design", "repair", "practical", "craft"],
    stream: "Vocational",
    points: 12,
  },
];

function normalizeScores(scoreProfile) {
  const entries = [
    ["Science", scoreProfile.science || 0],
    ["Commerce", scoreProfile.commerce || 0],
    ["Arts", scoreProfile.arts || 0],
    ["Vocational", scoreProfile.vocational || 0],
  ];

  const maxScore = Math.max(...entries.map(([, value]) => value), 1);

  return Object.fromEntries(
    entries.map(([key, value]) => [key, Math.round((value / maxScore) * 100)])
  );
}

function applyProfileBoosts(scoreProfile, user) {
  const nextScores = { ...scoreProfile };
  const interests = (user.interests || []).map((item) => item.toLowerCase());
  const strengths = (user.strengths || []).map((item) => item.toLowerCase());

  interestRules.forEach((rule) => {
    const matched = [...interests, ...strengths].some((value) =>
      rule.matchers.some((matcher) => value.includes(matcher))
    );

    if (matched) {
      nextScores[rule.stream.toLowerCase()] += rule.points;
    }
  });

  if (user.classLevel === "10") {
    nextScores.vocational += 4;
  }

  return nextScores;
}

function generateExplanation(scores, user) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topStream, topScore] = sorted[0];
  const second = sorted[1];
  const explanations = [
    `${topStream} stands out because your assessment responses aligned strongly with ${topStream.toLowerCase()}-oriented subjects and working styles.`,
  ];

  if ((user.interests || []).length) {
    explanations.push(
      `Your stated interests in ${user.interests.slice(0, 3).join(", ")} reinforced this recommendation.`
    );
  }

  if (second) {
    explanations.push(
      `${second[0]} is also a strong fit, scoring ${second[1]} compared with ${topScore} for ${topStream}.`
    );
  }

  return explanations;
}

function buildRecommendation(scoreProfile, user) {
  const boostedScores = applyProfileBoosts(scoreProfile, user);
  const normalized = normalizeScores(boostedScores);
  const rankedStreams = STREAM_ORDER.slice().sort(
    (left, right) => normalized[right] - normalized[left]
  );

  return {
    rawScores: boostedScores,
    normalizedScores: normalized,
    rankedStreams,
    explanations: generateExplanation(normalized, user),
  };
}

module.exports = { buildRecommendation };
