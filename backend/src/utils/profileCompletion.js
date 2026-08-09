function getMissingProfileFields(user) {
  const missing = [];

  if (!user.board?.trim()) missing.push("board");
  if (!user.location?.state?.trim()) missing.push("state");
  if (!user.location?.city?.trim()) missing.push("city");
  if (!user.language?.trim()) missing.push("language");
  if (!Array.isArray(user.interests) || !user.interests.length) missing.push("interests");
  if (!Array.isArray(user.strengths) || !user.strengths.length) missing.push("strengths");
  if (user.currentMarks === undefined || user.currentMarks === null) missing.push("marks");

  return missing;
}

function isProfileComplete(user) {
  return getMissingProfileFields(user).length === 0;
}

module.exports = { getMissingProfileFields, isProfileComplete };
