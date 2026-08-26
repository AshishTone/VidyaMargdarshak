const mongoose = require("mongoose");
const schema = new mongoose.Schema({ questionId: { type: mongoose.Schema.Types.Mixed, index: true }, categoryId: String, category: String, text: { en: String, mr: String }, active: Boolean, status: String, order: Number, version: Number }, { strict: false, collection: "interest_questions" });
module.exports = mongoose.model("InterestQuestion", schema);
