const express = require("express");
const {
  listColleges,
  getCollegeById,
  getCollegeCourses,
} = require("../controllers/collegeController");

const {
  getRecommendations,
  searchColleges,
  getFilterOptions,
  getPathways,
  getCollegeCatalogById,
} = require("../modules/collegesCatalog/collegesCatalogController");

const router = express.Router();

// Colleges Catalog Module Endpoints
router.get("/recommended", getRecommendations);
router.post("/recommended", getRecommendations);
router.get("/search", searchColleges);
router.get("/meta/filters", getFilterOptions);
router.get("/pathways", getPathways);
router.get("/catalog/:id", getCollegeCatalogById);

router.get("/", listColleges);
router.get("/:id", async (req, res, next) => {
  // If id is a catalog ID or not a Mongo ObjectId, check catalog first
  if (req.params.id && (req.params.id.startsWith("COL_") || req.params.id.length !== 24)) {
    return getCollegeCatalogById(req, res);
  }
  try {
    return await getCollegeById(req, res, next);
  } catch (err) {
    return getCollegeCatalogById(req, res);
  }
});
router.get("/:id/courses", getCollegeCourses);

module.exports = router;
