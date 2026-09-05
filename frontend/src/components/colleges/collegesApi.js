import api from '../../services/api';

export async function fetchPathways(educationLevel = null) {
  try {
    const params = {};
    if (educationLevel && educationLevel !== 'All') {
      params.educationLevel = educationLevel;
    }
    const res = await api.get('/colleges/pathways', { params });
    return res.data;
  } catch (err) {
    console.error('Failed to fetch pathways:', err);
    return { success: false, pathways: [] };
  }
}

export async function fetchFilterOptions() {
  try {
    const res = await api.get('/colleges/meta/filters');
    return res.data;
  } catch (err) {
    console.error('Failed to fetch filter options:', err);
    return { success: false, districts: [], states: [], categories: [], institutionTypes: [] };
  }
}

export async function fetchRecommendedColleges({
  lat,
  lng,
  district,
  strictDistrict = false,
  courses = [],
  pathways = [],
  radius = 50,
  educationLevel = null,
  institutionType = null
}) {
  try {
    const payload = {
      lat,
      lng,
      district,
      strictDistrict,
      courses,
      pathways,
      radius,
      educationLevel: educationLevel === 'All' ? null : educationLevel,
      institutionType: institutionType === 'All' ? null : institutionType
    };
    const res = await api.post('/colleges/recommended', payload);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch recommended colleges:', err);
    return { success: false, colleges: [], message: err.response?.data?.message || err.message };
  }
}

export async function searchColleges(params = {}) {
  try {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'All') {
        cleanParams[key] = params[key];
      }
    });
    const res = await api.get('/colleges/search', { params: cleanParams });
    return res.data;
  } catch (err) {
    console.error('Failed to search colleges:', err);
    return { success: false, colleges: [], pagination: { total: 0, page: 1, pages: 1 } };
  }
}

export async function fetchCollegeById(id) {
  try {
    const res = await api.get(`/colleges/catalog/${id}`);
    return res.data;
  } catch (err) {
    // Fallback to standard college route if catalog endpoint fails
    try {
      const fallbackRes = await api.get(`/colleges/${id}`);
      return fallbackRes.data;
    } catch (fallbackErr) {
      console.error('Failed to fetch college by id:', fallbackErr);
      return { success: false, college: null };
    }
  }
}
