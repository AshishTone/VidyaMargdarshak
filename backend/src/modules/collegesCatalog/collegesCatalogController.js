const { loadCatalogColleges } = require('./catalogDataService');
const { computeRecommendations } = require('./recommendationService');
const { getPathways: getPathwaysService } = require('./courseMappingService');
const geoCentroids = require('./geoCentroids.json');

/**
 * GET/POST /api/v1/colleges/recommended
 */
exports.getRecommendations = async (req, res) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;

    let {
      lat,
      lng,
      district,
      strictDistrict = false,
      courses = [],
      pathways = [],
      radius = 50,
      educationLevel = null,
      institutionType = null,
      limit = 40
    } = params;

    if (typeof courses === 'string') {
      courses = courses.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof pathways === 'string') {
      pathways = pathways.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof strictDistrict === 'string') {
      strictDistrict = strictDistrict === 'true' || strictDistrict === '1';
    }

    // If district is provided, ensure lat/lng are synced with that district's known coordinates
    if (district && district !== 'All') {
      const cleanDist = district.trim().toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
      const centroid = geoCentroids.districts[cleanDist];
      if (centroid) {
        lat = centroid.lat;
        lng = centroid.lng;
      } else {
        for (const [k, v] of Object.entries(geoCentroids.districts)) {
          if (cleanDist.includes(k) || k.includes(cleanDist)) {
            lat = v.lat;
            lng = v.lng;
            break;
          }
        }
      }
    }

    if (!lat || !lng) {
      // Default to Maharashtra centroid if neither coordinate nor valid district is provided
      lat = 19.7515;
      lng = 75.7139;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius) || 50;
    const limitNum = parseInt(limit) || 40;

    const scored = await computeRecommendations({
      latitude,
      longitude,
      district,
      strictDistrict,
      courses,
      pathways,
      radiusKm,
      educationLevel: educationLevel && educationLevel !== 'All' ? educationLevel : null,
      institutionType: institutionType && institutionType !== 'All' ? institutionType : null,
      limitNum
    });

    return res.json({
      success: true,
      count: scored.length,
      userLocation: { lat: latitude, lng: longitude, district: district || null },
      radiusKm,
      strictDistrict,
      educationLevel: educationLevel || 'All',
      colleges: scored
    });
  } catch (err) {
    console.error('Error in getRecommendations:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching college recommendations.'
    });
  }
};

/**
 * GET /api/v1/colleges/search
 */
exports.searchColleges = async (req, res) => {
  try {
    const {
      q,
      district,
      state,
      educationLevel,
      category,
      institutionType,
      page = 1,
      limit = 18
    } = req.query;

    const list = await loadCatalogColleges();
    const cleanQ = q ? q.trim().toLowerCase() : '';
    const cleanDist = district && district !== 'All' ? district.trim().toLowerCase() : '';
    const cleanState = state && state !== 'All' ? state.trim().toLowerCase() : '';

    const filtered = [];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];

      if (cleanQ) {
        const matchName = (c.name || '').toLowerCase().includes(cleanQ);
        const matchDist = (c.address?.district || '').toLowerCase().includes(cleanQ);
        const matchCourse = (c.courses || []).some(crs => (crs.name || '').toLowerCase().includes(cleanQ));
        const matchUni = cleanQ.length > 5 && (c.university || '').toLowerCase().includes(cleanQ);
        if (!matchName && !matchUni && !matchDist && !matchCourse) continue;
      }

      if (cleanDist && !(c.address?.district || '').toLowerCase().includes(cleanDist)) {
        continue;
      }

      if (cleanState && !(c.address?.state || '').toLowerCase().includes(cleanState)) {
        continue;
      }

      if (educationLevel && educationLevel !== 'All' && !c.educationLevels?.includes(educationLevel)) {
        continue;
      }

      if (category && category !== 'All' && !c.categories?.includes(category)) {
        continue;
      }

      if (institutionType && institutionType !== 'All') {
        const cType = (c.institutionType || '').toLowerCase();
        if (institutionType === 'Government' && !cType.includes('gov') && !cType.includes('aided')) continue;
        if (institutionType === 'Private' && !cType.includes('pvt') && !cType.includes('private') && !cType.includes('unaided')) continue;
      }

      filtered.push(c);
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 18));
    const skip = (pageNum - 1) * limitNum;

    return res.json({
      success: true,
      colleges: filtered.slice(skip, skip + limitNum),
      pagination: {
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(filtered.length / limitNum)
      }
    });
  } catch (err) {
    console.error('Error in searchColleges:', err);
    return res.status(500).json({ success: false, message: 'Server error while searching colleges.' });
  }
};

/**
 * GET /api/v1/colleges/meta/filters
 */
exports.getFilterOptions = async (req, res) => {
  try {
    const list = await loadCatalogColleges();
    const districtSet = new Set();
    const stateSet = new Set();
    const catSet = new Set();
    const instSet = new Set(['Government', 'Private']);

    // Canonical districts & states
    Object.values(geoCentroids.districts).forEach(d => districtSet.add(d.name));
    Object.values(geoCentroids.states).forEach(s => stateSet.add(s.name));

    list.forEach(c => {
      if (c.address?.district && c.address.district.length > 2) {
        if (!c.address.district.includes('(') && !c.address.district.includes('.')) {
          districtSet.add(c.address.district);
        }
      }
      if (c.address?.state && c.address.state.length > 2) {
        stateSet.add(c.address.state);
      }
      (c.categories || []).forEach(cat => catSet.add(cat));
    });

    return res.json({
      success: true,
      districts: Array.from(districtSet).sort(),
      states: Array.from(stateSet).sort(),
      categories: Array.from(catSet).sort(),
      institutionTypes: Array.from(instSet).sort(),
      knownCentroids: geoCentroids.districts
    });
  } catch (err) {
    console.error('Error in getFilterOptions:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve filter options.' });
  }
};

/**
 * GET /api/v1/colleges/pathways
 */
exports.getPathways = async (req, res) => {
  try {
    const { educationLevel } = req.query;
    const pathways = await getPathwaysService(educationLevel);
    return res.json({
      success: true,
      pathways
    });
  } catch (err) {
    console.error('Error in getPathways:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load pathways.'
    });
  }
};

/**
 * GET /api/v1/colleges/catalog/:id
 */
exports.getCollegeCatalogById = async (req, res) => {
  try {
    const list = await loadCatalogColleges();
    const id = req.params.id;
    const cleanSlug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 1. Direct match by collegeId or _id
    let found = list.find(c => 
      c.collegeId === id || 
      c._id === id || 
      (c.collegeId && c.collegeId.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug) ||
      (c.name && c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug)
    );

    if (found) return res.json({ success: true, college: found });

    // 2. If it is a MongoDB ObjectId, check MongoDB College model then match to catalog
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      const College = require('../../models/College');
      const mongoCol = await College.findById(id).lean();
      if (mongoCol) {
        const mSlug = (mongoCol.slug || mongoCol.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const catalogMatch = list.find(c => 
          (c.collegeId && c.collegeId.toLowerCase().replace(/[^a-z0-9]+/g, '-') === mSlug) ||
          (c.name && c.name.toLowerCase() === mongoCol.name.toLowerCase())
        );
        if (catalogMatch) {
          return res.json({ success: true, college: catalogMatch });
        }
        return res.json({
          success: true,
          college: {
            _id: mongoCol._id,
            collegeId: mongoCol.slug || mongoCol._id,
            name: mongoCol.name,
            address: {
              full: mongoCol.location?.address || '',
              district: mongoCol.location?.city || '',
              state: mongoCol.location?.state || 'Maharashtra'
            },
            location: {
              type: 'Point',
              coordinates: [mongoCol.location?.lng || 75.7, mongoCol.location?.lat || 19.7]
            },
            institutionType: mongoCol.type || 'College',
            university: '',
            website: mongoCol.contact?.website || '',
            email: mongoCol.contact?.email || '',
            phone: mongoCol.contact?.phone || '',
            courses: mongoCol.coursesOffered || [],
            categories: mongoCol.facilities || []
          }
        });
      }
    }

    return res.status(404).json({ success: false, message: 'College not found in catalog.' });
  } catch (err) {
    console.error('Error in getCollegeCatalogById:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve college details.' });
  }
};
