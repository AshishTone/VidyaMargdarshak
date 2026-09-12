function getMissingProfileFields(user) {
  const missing = [];

  if (!user.name?.trim()) missing.push("name");
  if (!user.dateOfBirth) missing.push("dateOfBirth");
  if (user.classLevel === "10") {
    if (!user.tenthBoard?.trim()) missing.push("tenthBoard");
    if (!user.tenthPassingDate && !user.tenthPassingYear) missing.push("tenthPassingDate");
  }
  if (user.classLevel === "12") {
    if (!user.twelfthBoard?.trim()) missing.push("twelfthBoard");
    if (!user.twelfthPassingDate) missing.push("twelfthPassingDate");
    if (!user.twelfthStream) missing.push("twelfthStream");
  }
  if (!user.location?.district?.trim()) missing.push("district");

  return missing;
}

function isProfileComplete(user) {
  return getMissingProfileFields(user).length === 0;
}

module.exports = { getMissingProfileFields, isProfileComplete };
