const env = require("../config/env");

const MERMAID_ROADMAP_PROMPT = `You are VidyaMargdarshak AI, the authoritative Indian education and career guidance architect.
Your task is to analyze the student's assessment results and generate a pure, clean, non-entangled TREE diagram in Mermaid.js (flowchart LR) representing their complete Indian education-to-career pathways.

MANDATORY REQUIREMENT: STRICT TREE TOPOLOGY (NO MULTIPLE PARENTS)
1. The diagram MUST be a strict mathematical TREE: Every node (except the root) MUST have EXACTLY ONE parent (only ONE incoming arrow).
2. DO NOT MERGE edges or create shared nodes. No child node can have 2 or more arrows pointing to it.
3. NEVER criss-cross lines. Each of the student's 3 recommended courses MUST branch into its own completely separate, dedicated pathway tree.

TREE ARCHITECTURE:
The tree starts from ONE root node and branches out cleanly:
- ROOT NODE:
  ROOT["🎓 Student Name - Class Level & Stream"]:::rootNode

- BRANCH 1 (Dedicated tree for Top Recommended Course 1):
  ROOT --> P1["1️⃣ Pathway 1: Course 1 Name"]:::pathNode
  P1 --> EX1["📝 Entrance: Key Indian Entrance Exams (e.g. JEE/NEET/CUET/CETs)"]:::examNode
  EX1 --> DEG1["🎓 Degree: Course 1 Program at Premier Indian Colleges (IITs/NITs/Univ)"]:::degreeNode
  DEG1 --> PG1["📜 Higher Studies: Masters / Specialization (via GATE/CAT/Entrance)"]:::pgNode
  PG1 --> CAR1["⭐ Top Career Roles: High-Growth Industry & Tech Careers"]:::careerNode
  DEG1 --> GOV1["🏛️ Indian Public Sector / UPSC / Govt Opportunities"]:::govNode

- BRANCH 2 (Dedicated tree for Top Recommended Course 2):
  ROOT --> P2["2️⃣ Pathway 2: Course 2 Name"]:::pathNode
  P2 --> EX2["📝 Entrance: Key Indian Entrance Exams & Merit Routes"]:::examNode
  EX2 --> DEG2["🎓 Degree: Course 2 Program at Premier Indian Colleges"]:::degreeNode
  DEG2 --> PG2["📜 Higher Studies: Dedicated Masters / Specialization"]:::pgNode
  PG2 --> CAR2["⭐ Top Career Roles: Dedicated Industry & Specialist Roles"]:::careerNode
  DEG2 --> GOV2["🏛️ Indian Public Sector / PSUs / Govt Opportunities"]:::govNode

- BRANCH 3 (Dedicated tree for Top Recommended Course 3):
  ROOT --> P3["3️⃣ Pathway 3: Course 3 Name"]:::pathNode
  P3 --> EX3["📝 Entrance: Key Indian Entrance Exams & Merit Routes"]:::examNode
  EX3 --> DEG3["🎓 Degree: Course 3 Program at Premier Indian Colleges"]:::degreeNode
  DEG3 --> PG3["📜 Higher Studies: Dedicated Masters / Specialization"]:::pgNode
  PG3 --> CAR3["⭐ Top Career Roles: Dedicated Industry & Core Roles"]:::careerNode
  DEG3 --> GOV3["🏛️ Indian Public Sector / PSUs / Govt Opportunities"]:::govNode

MERMAID SYNTAX & STYLING RULES:
- Start with 'flowchart LR'.
- Node definitions: Use round curvy nodes with parentheses syntax: ID("Label text"). This makes every node visually smooth, soft, and curvy rather than sharp rectangles. Keep labels clear, descriptive, and relevant to the Indian education ecosystem. Do NOT put unescaped double quotes inside labels.
- Arrows: Only use single directional arrows (-->).
- Every node ID must be unique (e.g., ROOT, P1, EX1, DEG1, PG1, CAR1, GOV1, P2, EX2, DEG2, PG2, CAR2, GOV2, P3, EX3, DEG3, PG3, CAR3, GOV3).
- Include classDef definitions at the bottom with curvy corner radius (rx:18, ry:18):
  classDef rootNode fill:#1e1b4b,stroke:#6366f1,stroke-width:2.5px,color:#ffffff,rx:18,ry:18;
  classDef pathNode fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff,rx:16,ry:16;
  classDef examNode fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#ffffff,rx:16,ry:16;
  classDef degreeNode fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#ffffff,rx:16,ry:16;
  classDef pgNode fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#ffffff,rx:16,ry:16;
  classDef careerNode fill:#065f46,stroke:#10b981,stroke-width:2.5px,color:#ffffff,rx:16,ry:16;
  classDef govNode fill:#4c1d95,stroke:#a855f7,stroke-width:2px,color:#ffffff,rx:16,ry:16;

RETURN FORMAT:
Return a single JSON object conforming to:
{
  "title": "Title of Roadmap",
  "summary": "2-3 sentences explaining this clean tree pathway for the student's top 3 recommended courses in India",
  "topCourses": ["Recommended Course 1", "Recommended Course 2", "Recommended Course 3"],
  "mermaidChart": "flowchart LR\\n...complete valid tree mermaid code..."
}`;

async function generatePersonalizedRoadmapWithLLM(assessmentData, userProfile) {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // 1. Extract Top 3 Recommended Courses from assessment results
  let topCourses = [];
  if (assessmentData.structuredRecommendations?.recommendations?.length > 0) {
    topCourses = assessmentData.structuredRecommendations.recommendations
      .slice(0, 3)
      .map((r) => ({
        course: r.pathway,
        matchScore: `${Math.round(r.matchScore || 90)}/100`,
        eligibility: r.eligibility || "",
      }));
  }

  // Fallback to top interest categories if course list isn't populated
  if (topCourses.length === 0) {
    const topCats = (assessmentData.topCategories || []).slice(0, 3);
    topCourses = topCats.map((cat, i) => ({
      course: cat.replaceAll("_", " "),
      matchScore: `${95 - i * 5}/100`,
      eligibility: "Class 10/12 Standard",
    }));
  }

  const payload = {
    studentName: userProfile.name || "Student",
    classLevel: userProfile.classLevel || "12",
    stream: userProfile.twelfthStream || userProfile.stream || "Science (PCM)",
    country: "India",
    interests: userProfile.interests || [],
    topThreeRecommendedCourses: topCourses,
  };

  const modelName = env.geminiModel || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${MERMAID_ROADMAP_PROMPT}\n\nSTUDENT BACKGROUND & TOP 3 RECOMMENDED COURSES IN INDIA (READ-ONLY):\n${JSON.stringify(payload, null, 2)}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            summary: { type: "STRING" },
            topCourses: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            mermaidChart: { type: "STRING" },
          },
          required: ["title", "summary", "topCourses", "mermaidChart"],
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API call failed with status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");

  if (!text) {
    throw new Error("No response generated by Gemini model.");
  }

  return JSON.parse(text);
}

module.exports = { generatePersonalizedRoadmapWithLLM };
