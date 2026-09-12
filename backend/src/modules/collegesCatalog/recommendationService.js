const { expandCourseQueries, normalizeCourseName } = require('./courseMappingService');
const { loadCatalogColleges } = require('./catalogDataService');

/**
 * Calculates Haversine distance in km between two lat/lng points.
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Computes recommendations from in-memory catalog
 */
async function computeRecommendations({
  latitude,
  longitude,
  district = null,
  strictDistrict = false,
  courses = [],
  pathways = [],
  radiusKm = 50,
  educationLevel = null,
  institutionType = null,
  limitNum = 40
}) {
  const catalog = await loadCatalogColleges();
  const { normalizedTokens, keywords } = await expandCourseQueries(courses, pathways);
  const hasCourseFilter = normalizedTokens.length > 0 || keywords.length > 0;

  const maxDegree = (radiusKm / 111.0) * 1.35; // 1 deg lat ~ 111 km
  const scored = [];
  const cleanFilterDistrict = (district && district !== 'All') ? district.trim().toLowerCase() : null;

  for (let i = 0; i < catalog.length; i++) {
    const c = catalog[i];
    const cDist = (c.address?.district || '').toLowerCase();

    // Strict District Matching (if user requests district-only search)
    if (strictDistrict && cleanFilterDistrict) {
      if (!cDist.includes(cleanFilterDistrict) && !cleanFilterDistrict.includes(cDist)) {
        continue;
      }
    }

    // 1. Education Stage Filter
    if (educationLevel && educationLevel !== 'All' && !c.educationLevels?.includes(educationLevel)) {
      continue;
    }

    // 2. Institution Type Filter
    if (institutionType && institutionType !== 'All') {
      const cType = (c.institutionType || '').toLowerCase();
      if (institutionType === 'Government' && !cType.includes('gov') && !cType.includes('aided')) {
        continue;
      }
      if (institutionType === 'Private' && !cType.includes('pvt') && !cType.includes('private') && !cType.includes('unaided')) {
        continue;
      }
    }

    // 3. Fast Bounding Box & Distance Filter
    const cLng = c.location?.coordinates?.[0];
    const cLat = c.location?.coordinates?.[1];

    if (cLat === undefined || cLng === undefined) continue;

    if (Math.abs(cLat - latitude) > maxDegree || Math.abs(cLng - longitude) > maxDegree) {
      continue;
    }

    const dist = calculateHaversineDistanceKm(latitude, longitude, cLat, cLng);
    if (dist > radiusKm) continue;

    // 4. Course Matching
    const matchedCourses = [];
    const otherCourses = [];

    for (const crs of (c.courses || [])) {
      let isMatch = false;
      let relevance = 0.5;
      const norm = crs.normalizedName || normalizeCourseName(crs.name);
      const lowerName = (crs.name || '').toLowerCase();

      if (normalizedTokens.includes(norm)) {
        isMatch = true;
        relevance = 1.0;
      } else {
        for (const kw of keywords) {
          if (lowerName.includes(kw) || kw.includes(lowerName)) {
            isMatch = true;
            relevance = Math.max(relevance, kw.length > 4 ? 0.9 : 0.75);
            break;
          }
        }
      }

      if (isMatch) {
        matchedCourses.push({
          name: crs.name,
          level: crs.level,
          intake: crs.intake || 0,
          approvalStatus: crs.approvalStatus || 'Approved',
          relevance
        });
      } else {
        otherCourses.push(crs.name);
      }
    }

    // If user specified courses/pathways, college must offer at least one matching course
    if (hasCourseFilter && matchedCourses.length === 0) {
      continue;
    }

    // Multi-factor Score (Strictly out of 100.0 points):
    // 1. Course Relevance & Depth (max 50.0 pts):
    //    - Top match relevance: up to 40.0 pts (exact match = 40.0, keyword match = 30.0 - 36.0)
    //    - Offering depth: up to 10.0 pts (based on matching programs count)
    const topCourseRel = matchedCourses.length > 0 ? Math.max(...matchedCourses.map(m => m.relevance)) : 0.35;
    const courseScore = (topCourseRel * 40.0) + Math.min(matchedCourses.length * 2.5, 10.0);

    // 2. Geographic Proximity (max 35.0 pts):
    //    - Decay formula: 35.0 / (1 + (distanceKm / 15.0))
    //    - 0 km -> 35.0 pts | 5 km -> 26.3 pts | 15 km -> 17.5 pts | 30 km -> 11.7 pts
    const distanceScore = 35.0 / (1.0 + (dist / 15.0));

    // 3. Accreditation / Regulatory Approval (max 10.0 pts):
    let approvalScore = 4.0;
    const hasAccredited = (c.courses || []).some(crs => 
      (crs.approvalStatus || '').toLowerCase().includes('accredited') || 
      (crs.approvalStatus || '').toLowerCase().includes('approved')
    );
    if (hasAccredited) approvalScore = 10.0;

    // 4. Institution Type (max 5.0 pts):
    let instScore = 3.0;
    const instType = (c.institutionType || '').toLowerCase();
    if (instType.includes('government') || instType.includes('aided')) {
      instScore = 5.0;
    }

    const rawScore = courseScore + distanceScore + approvalScore + instScore;
    const finalScore = Math.min(100.0, Math.max(0, Math.round(rawScore * 10) / 10));

    scored.push({
      _id: c.collegeId,
      collegeId: c.collegeId,
      name: c.name,
      address: c.address,
      location: c.location,
      distanceKm: dist,
      institutionType: c.institutionType,
      university: c.university,
      website: c.website,
      email: c.email,
      phone: c.phone,
      educationLevels: c.educationLevels,
      categories: c.categories,
      matchedCourses: matchedCourses.length > 0 ? matchedCourses : (c.courses || []).slice(0, 3),
      totalCoursesCount: (c.courses || []).length,
      recommendationScore: finalScore
    });
  }

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore || a.distanceKm - b.distanceKm);

  return scored.slice(0, limitNum);
}

module.exports = {
  calculateHaversineDistanceKm,
  computeRecommendations
};
