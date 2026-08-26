const mongoose = require("mongoose");
module.exports = mongoose.model("ExplorationTopic", new mongoose.Schema({ categoryId: String, title: { en: String, mr: String }, type: String, content: { en: String, mr: String }, relatedPathways: [String], active: Boolean }, { strict: false, collection: "exploration_topics" }));
