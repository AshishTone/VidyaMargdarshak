function getMissingProfileFields(user) {
  const missing = [];

  if (!user.board?.trim()) missing.push("board");
  if (!user.location?.state?.trim()) missing.push("state");
  if (!user.location?.city?.trim()) missing.push("city");
  if (!user.language?.trim()) missing.push("language");
  if (user.currentMarks === undefined || user.currentMarks === null) missing.push("marks");

  return missing;
}

function isProfileComplete(user) {
  return getMissingProfileFields(user).length === 0;
}

module.exports = { getMissingProfileFields, isProfileComplete };

