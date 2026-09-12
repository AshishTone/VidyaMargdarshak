const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB database:", mongoose.connection.db.databaseName);

  const db = mongoose.connection.db;

  // Load JSON documents
  const path10th = path.join(__dirname, "../data/career_roadmaps_10th.json");
  const path12th = path.join(__dirname, "../data/career_roadmaps_12th.json");

  const doc10th = JSON.parse(fs.readFileSync(path10th, "utf8"));
  const doc12th = JSON.parse(fs.readFileSync(path12th, "utf8"));

  // Ensure collections exist & insert/replace document
  const coll10th = db.collection("career_roadmaps_10th");
  const coll12th = db.collection("career_roadmaps_12th");

  console.log("Inserting document into career_roadmaps_10th...");
  const res10th = await coll10th.replaceOne(
    { "metadata.graphId": doc10th.metadata.graphId },
    doc10th,
    { upsert: true }
  );
  console.log("career_roadmaps_10th result:", {
    matchedCount: res10th.matchedCount,
    modifiedCount: res10th.modifiedCount,
    upsertedId: res10th.upsertedId,
    nodeCount: doc10th.nodes.length,
    edgeCount: doc10th.edges.length,
  });

  console.log("Inserting document into career_roadmaps_12th...");
  const res12th = await coll12th.replaceOne(
    { "metadata.graphId": doc12th.metadata.graphId },
    doc12th,
    { upsert: true }
  );
  console.log("career_roadmaps_12th result:", {
    matchedCount: res12th.matchedCount,
    modifiedCount: res12th.modifiedCount,
    upsertedId: res12th.upsertedId,
    nodeCount: doc12th.nodes.length,
    edgeCount: doc12th.edges.length,
  });

  // Verify by reading them back
  const count10 = await coll10th.countDocuments();
  const count12 = await coll12th.countDocuments();
  console.log(`Verification: career_roadmaps_10th has ${count10} document(s), career_roadmaps_12th has ${count12} document(s).`);

  await mongoose.disconnect();
  console.log("Seeding complete and disconnected.");
}

seed().catch((err) => {
  console.error("Error seeding roadmaps:", err);
  process.exit(1);
});
