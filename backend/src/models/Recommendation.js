const mongoose = require("mongoose");
module.exports = mongoose.model("Recommendation", new mongoose.Schema({ categoryId: String, conditions: mongoose.Schema.Types.Mixed, recommendedPathways: [String], priority: Number, active: Boolean }, { strict: false, collection: "recommendations" }));
