const fs = require('fs');
const path = require('path');

const CATALOG_FILE = path.resolve(__dirname, '../../data/collegesCatalog.json');

let cachedColleges = null;

/**
 * Loads the complete compiled catalog of all 32,978 colleges from collegesCatalog.json.
 * Caches in memory for millisecond retrieval.
 */
async function loadCatalogColleges() {
  if (cachedColleges && cachedColleges.length > 0) {
    return cachedColleges;
  }

  if (!fs.existsSync(CATALOG_FILE)) {
    console.error(`[Colleges Engine] collegesCatalog.json not found at: ${CATALOG_FILE}`);
    return [];
  }

  console.log('[Colleges Engine] Loading comprehensive catalog of 32,978 colleges into memory...');
  const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
  cachedColleges = JSON.parse(raw);
  console.log(`[Colleges Engine] Ready with ${cachedColleges.length} colleges across all districts.`);
  return cachedColleges;
}

module.exports = {
  loadCatalogColleges
};
