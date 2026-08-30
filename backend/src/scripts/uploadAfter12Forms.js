/*
 * One-purpose importer for the approved After-12th V1 question banks.
 * It writes only Assessment_Forms_PCM and Assessment_Forms_PCB.
 */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const env = require("../config/env");

const RESPONSE_SCALE = {
  min: 1,
  max: 5,
  options: [
    { value: 1, label: { en: "Strongly disagree", mr: "पूर्णपणे असहमत" } },
    { value: 2, label: { en: "Disagree", mr: "असहमत" } },
    { value: 3, label: { en: "Not sure / neutral", mr: "निश्चित नाही / तटस्थ" } },
    { value: 4, label: { en: "Agree", mr: "सहमत" } },
    { value: 5, label: { en: "Strongly agree", mr: "पूर्णपणे सहमत" } },
  ],
};

const specs = [
  { stream: "PCM", formId: "AFTER12_PCM_V1", collection: "Assessment_Forms_PCM", input: process.argv[2] },
  { stream: "PCB", formId: "AFTER12_PCB_V1", collection: "Assessment_Forms_PCB", input: process.argv[3] },
];

function buildForm(spec) {
  if (!spec.input) throw new Error(`Missing ${spec.stream} JSON file path.`);
  const sourcePath = path.resolve(spec.input);
  const sourceQuestions = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const expectedCount = spec.stream === "PCM" ? 70 : 56;
  if (!Array.isArray(sourceQuestions) || sourceQuestions.length !== expectedCount) {
    throw new Error(`${spec.stream} must contain exactly ${expectedCount} questions.`);
  }
  const categories = {};
  const questions = sourceQuestions.map((question, index) => {
    if (!question.questionId || !question.category || !question.text?.en || !question.text?.mr) {
      throw new Error(`${spec.stream} question ${index + 1} is incomplete.`);
    }
    categories[question.category] = (categories[question.category] || 0) + 1;
    return { ...question, order: index + 1, categoryId: question.category };
  });
  if (Object.values(categories).some(count => count !== 7)) {
    throw new Error(`${spec.stream} domains must contain seven questions each.`);
  }
  return {
    formId: spec.formId,
    assessmentId: spec.formId,
    assessmentType: "AFTER12",
    targetLevel: "AFTER_12TH",
    stream: spec.stream,
    version: 1,
    name: { en: `After-12th ${spec.stream} Interest Assessment`, mr: `इयत्ता १२ नंतरची ${spec.stream} आवड मूल्यांकन` },
    questionCount: questions.length,
    questions,
    questionIds: questions.map(question => question.questionId),
    questionsPerCategory: categories,
    responseScale: RESPONSE_SCALE,
    scoring: { formula: "((rawScore - minScore) / (maxScore - minScore)) * 100", minResponse: 1, maxResponse: 5, questionsPerDomain: 7, calculationVersion: "AFTER12_SCORE_V1" },
    status: "ACTIVE",
  };
}

async function run() {
  if (!env.mongoUri) throw new Error("MONGO_URI is not configured.");
  const client = new MongoClient(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  try {
    for (const spec of specs) {
      const form = buildForm(spec);
      const collection = client.db().collection(spec.collection);
      const existing = await collection.findOne({ formId: form.formId }, { projection: { _id: 1 } });
      if (existing) throw new Error(`${form.formId} already exists in ${spec.collection}; no change was made.`);
      await collection.insertOne(form);
      console.log(`Inserted ${form.formId} (${form.questionCount} questions) into ${spec.collection}.`);
    }
  } finally {
    await client.close();
  }
}

run().catch(error => { console.error(error.message); process.exitCode = 1; });
