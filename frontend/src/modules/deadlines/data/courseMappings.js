/**
 * Course Mappings and Synonym Normalization Dictionary
 * Translates student queries and synonyms into standardized keys and relevant official source IDs.
 */

export const courseMappings = {
  "computer-engineering": [
    "mht-cet",
    "jee-main",
    "jee-advanced",
    "josaa",
    "csab",
    "bitsat",
    "viteee",
    "comedk"
  ],

  "mechanical-engineering": [
    "mht-cet",
    "jee-main",
    "jee-advanced",
    "josaa",
    "csab",
    "bitsat",
    "comedk"
  ],

  "civil-engineering": [
    "mht-cet",
    "jee-main",
    "jee-advanced",
    "josaa",
    "csab",
    "comedk"
  ],

  "electrical-engineering": [
    "mht-cet",
    "jee-main",
    "jee-advanced",
    "josaa",
    "csab",
    "bitsat",
    "viteee"
  ],

  "engineering": [
    "mht-cet",
    "jee-main",
    "jee-advanced",
    "josaa",
    "csab",
    "bitsat",
    "viteee",
    "comedk",
    "dte-maharashtra"
  ],

  "medicine": [
    "neet-ug",
    "mht-cet"
  ],

  "pharmacy": [
    "mht-cet",
    "bitsat"
  ],

  "architecture": [
    "nata",
    "jee-main",
    "mht-cet",
    "josaa",
    "comedk"
  ],

  "law": [
    "clat",
    "ailet",
    "mht-cet"
  ],

  "bca": [
    "mht-cet",
    "cuet-ug"
  ],

  "bba": [
    "mht-cet",
    "cuet-ug"
  ],

  "bms": [
    "mht-cet",
    "cuet-ug"
  ],

  "design": [
    "uceed",
    "nid",
    "nift"
  ],

  "agriculture": [
    "maharashtra-agriculture",
    "mht-cet"
  ],

  "hotel-management": [
    "nchm-jee",
    "mht-cet"
  ],

  "defence": [
    "upsc-nda"
  ],

  "fyjc": [
    "maha-fyjc"
  ],

  "class-10": [
    "maha-fyjc",
    "dte-maharashtra",
    "mahahsscboard"
  ],

  "polytechnic": [
    "dte-maharashtra"
  ],

  "state-board": [
    "mahahsscboard"
  ]
};

// Synonyms mapping student queries to standardized course keys
export const synonymDictionary = {
  // Computer / Tech
  "cse": "computer-engineering",
  "computer science": "computer-engineering",
  "computer engineering": "computer-engineering",
  "computer science engineering": "computer-engineering",
  "b.tech cse": "computer-engineering",
  "btech cse": "computer-engineering",
  "b.e. computer": "computer-engineering",
  "be computer": "computer-engineering",
  "cs": "computer-engineering",
  "it": "computer-engineering",
  "information technology": "computer-engineering",
  "ai": "computer-engineering",
  "data science": "computer-engineering",
  "software engineering": "computer-engineering",

  // General Engineering
  "engineering": "engineering",
  "btech": "engineering",
  "b.tech": "engineering",
  "be": "engineering",
  "b.e.": "engineering",
  "mechanical": "mechanical-engineering",
  "mechanical engineering": "mechanical-engineering",
  "civil": "civil-engineering",
  "civil engineering": "civil-engineering",
  "electrical": "electrical-engineering",
  "electrical engineering": "electrical-engineering",
  "polytechnic": "polytechnic",
  "diploma": "polytechnic",
  "diploma in engineering": "polytechnic",

  // Medical / Health
  "mbbs": "medicine",
  "medicine": "medicine",
  "medical": "medicine",
  "doctor": "medicine",
  "bds": "medicine",
  "dental": "medicine",
  "ayush": "medicine",
  "bams": "medicine",
  "bhms": "medicine",
  "nursing": "medicine",
  "pharmacy": "pharmacy",
  "b.pharm": "pharmacy",
  "bpharm": "pharmacy",
  "d.pharm": "pharmacy",

  // Architecture
  "b.arch": "architecture",
  "barch": "architecture",
  "architecture": "architecture",
  "architect": "architecture",
  "b.planning": "architecture",

  // Law
  "law": "law",
  "integrated law": "law",
  "ba llb": "law",
  "bba llb": "law",
  "llb": "law",
  "clat": "law",
  "legal studies": "law",

  // Computer Applications & Management
  "bca": "bca",
  "bachelor of computer applications": "bca",
  "bba": "bba",
  "bachelor of business administration": "bba",
  "bms": "bms",
  "bbm": "bms",
  "management": "bba",
  "commerce": "bba",

  // Design & Fashion
  "design": "design",
  "bdes": "design",
  "b.des": "design",
  "fashion": "design",
  "fashion design": "design",
  "nift": "design",
  "interior design": "design",

  // Agriculture
  "agriculture": "agriculture",
  "b.sc agriculture": "agriculture",
  "bsc agriculture": "agriculture",
  "agri": "agriculture",
  "horticulture": "agriculture",
  "food technology": "agriculture",

  // Hotel Management
  "hotel management": "hotel-management",
  "hospitality": "hotel-management",
  "nchm": "hotel-management",
  "ihm": "hotel-management",

  // Defence
  "nda": "defence",
  "defence": "defence",
  "defense": "defence",
  "naval academy": "defence",
  "army": "defence",
  "navy": "defence",
  "air force": "defence",

  // FYJC / 11th
  "fyjc": "fyjc",
  "11th": "fyjc",
  "class 11": "fyjc",
  "class 11th": "fyjc",
  "11th admission": "fyjc",
  "std 11": "fyjc",
  "std 11th": "fyjc",
  "maharashtra 11th": "fyjc",
  "fyjc science": "fyjc",
  "fyjc commerce": "fyjc",
  "fyjc arts": "fyjc",

  // Boards & 10th Standard Pathways
  "10th": "class-10",
  "class 10": "class-10",
  "class 10th": "class-10",
  "std 10": "class-10",
  "std 10th": "class-10",
  "after 10th": "class-10",
  "after class 10": "class-10",
  "post ssc": "class-10",
  "post-ssc": "class-10",
  "10th pass": "class-10",
  "ssc": "state-board",
  "hsc": "state-board",
  "10th board": "state-board",
  "12th board": "state-board"
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes input text query into a canonical course key
 * @param {string} rawInput 
 * @returns {string} canonical key or normalized slug
 */
export function normalizeCourseQuery(rawInput = "") {
  if (!rawInput) return "engineering";
  const clean = rawInput.toLowerCase().trim();

  // 1. Direct match in courseMappings
  if (courseMappings[clean]) {
    return clean;
  }

  // 2. Exact match in synonym dictionary
  if (synonymDictionary[clean]) {
    return synonymDictionary[clean];
  }

  // 3. Whole-word or boundary match (sort longer phrases first)
  const sortedPhrases = Object.keys(synonymDictionary).sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    if (phrase.length <= 3) {
      const regex = new RegExp(`(^|\\s|[^a-z0-9])${escapeRegex(phrase)}($|\\s|[^a-z0-9])`, 'i');
      if (regex.test(clean)) {
        return synonymDictionary[phrase];
      }
    } else {
      if (clean.includes(phrase)) {
        return synonymDictionary[phrase];
      }
    }
  }

  // Fallback slug
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Get matching source IDs for a given course key
 * @param {string} courseKey 
 * @returns {string[]} source IDs
 */
export function getSourcesForCourse(courseKey) {
  const normalizedKey = normalizeCourseQuery(courseKey);
  return courseMappings[normalizedKey] || courseMappings["engineering"];
}

export default {
  courseMappings,
  synonymDictionary,
  normalizeCourseQuery,
  getSourcesForCourse
};
