const defaultMappings = require('./defaultCourseMappings.json');

/**
 * Normalizes course strings into a standardized slug identifier.
 * Example: "Computer Science and Engineering" -> "computer_science_engineering"
 */
function normalizeCourseName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Retrieves all registered pathways.
 */
async function getPathways(educationLevel = null) {
  if (educationLevel && educationLevel !== 'All') {
    return defaultMappings.filter(m => m.educationLevels.includes(educationLevel));
  }
  return defaultMappings;
}

/**
 * Expands input courses or pathways into normalized tokens for precise matching.
 * Does not over-expand specific course inputs to unrelated branches of engineering.
 */
async function expandCourseQueries(courseInputs = [], pathwayInputs = []) {
  const normalizedTargets = new Set();
  const searchKeywords = new Set();

  // 1. Add specific course targets
  for (const c of courseInputs) {
    if (typeof c === 'string' && c.trim()) {
      const norm = normalizeCourseName(c);
      normalizedTargets.add(norm);
      searchKeywords.add(c.trim().toLowerCase());

      // Add direct synonyms for common courses
      if (norm.includes('computer')) {
        normalizedTargets.add('computer_engineering');
        normalizedTargets.add('computer_science_and_engineering');
        normalizedTargets.add('computer_science_engineering');
        normalizedTargets.add('information_technology');
        searchKeywords.add('computer');
        searchKeywords.add('cse');
      } else if (norm.includes('civil')) {
        normalizedTargets.add('civil_engineering');
        searchKeywords.add('civil');
      } else if (norm.includes('mechanical')) {
        normalizedTargets.add('mechanical_engineering');
        searchKeywords.add('mechanical');
      } else if (norm.includes('electrical')) {
        normalizedTargets.add('electrical_engineering');
        searchKeywords.add('electrical');
      } else if (norm.includes('pharm')) {
        normalizedTargets.add('b_pharm');
        normalizedTargets.add('d_pharm');
        searchKeywords.add('pharm');
      } else if (norm.includes('architect')) {
        normalizedTargets.add('architecture');
        normalizedTargets.add('bachelor_of_architecture');
        searchKeywords.add('architecture');
      }
    }
  }

  // 2. Only expand pathways if user explicitly provided pathway inputs
  if (pathwayInputs && pathwayInputs.length > 0) {
    const allPathways = await getPathways();
    for (const p of pathwayInputs) {
      const matchedPathway = allPathways.find(
        m => m.pathwayId.toLowerCase() === p.toLowerCase() || m.pathwayName.toLowerCase() === p.toLowerCase()
      );
      if (matchedPathway) {
        matchedPathway.courses.forEach(course => normalizedTargets.add(course));
        matchedPathway.keywords.forEach(kw => searchKeywords.add(kw));
      }
    }
  }

  return {
    normalizedTokens: Array.from(normalizedTargets),
    keywords: Array.from(searchKeywords)
  };
}

module.exports = {
  normalizeCourseName,
  getPathways,
  expandCourseQueries
};
