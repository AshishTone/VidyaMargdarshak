const { connectDatabase } = require("../config/db");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Question = require("../models/Question");
const Course = require("../models/Course");
const College = require("../models/College");
const Deadline = require("../models/Deadline");
const Resource = require("../models/Resource");
const RoadmapNode = require("../models/RoadmapNode");
const RoadmapEdge = require("../models/RoadmapEdge");


const obsoleteCollegeSlugs = [
  "skyline-institute-of-technology",
  "riverdale-commerce-management-college",
  "harmony-school-of-humanities",
  "craftbridge-vocational-academy",
];

const createLikertOptions = (keyPrefix, weights, reverseWeights = {}) => [
  {
    label: "Strongly Agree",
    value: `${keyPrefix}-strongly-agree`,
    weights: {
      science: weights.science || 0,
      commerce: weights.commerce || 0,
      arts: weights.arts || 0,
      vocational: weights.vocational || 0,
    },
  },
  {
    label: "Agree",
    value: `${keyPrefix}-agree`,
    weights: {
      science: Math.round((weights.science || 0) * 0.65),
      commerce: Math.round((weights.commerce || 0) * 0.65),
      arts: Math.round((weights.arts || 0) * 0.65),
      vocational: Math.round((weights.vocational || 0) * 0.65),
    },
  },
  {
    label: "Neutral",
    value: `${keyPrefix}-neutral`,
    weights: { science: 1, commerce: 1, arts: 1, vocational: 1 },
  },
  {
    label: "Disagree",
    value: `${keyPrefix}-disagree`,
    weights: {
      science: reverseWeights.science || 0,
      commerce: reverseWeights.commerce || 0,
      arts: reverseWeights.arts || 0,
      vocational: reverseWeights.vocational || 0,
    },
  },
  {
    label: "Strongly Disagree",
    value: `${keyPrefix}-strongly-disagree`,
    weights: {
      science: Math.round((reverseWeights.science || 0) * 1.5),
      commerce: Math.round((reverseWeights.commerce || 0) * 1.5),
      arts: Math.round((reverseWeights.arts || 0) * 1.5),
      vocational: Math.round((reverseWeights.vocational || 0) * 1.5),
    },
  },
];

const sampleQuestions = [
  // LOGIC & MATHEMATICS (q1 - q11)
  {
    order: 1,
    classLevel: "10",
    category: "logic",
    question: "I enjoy solving complex mathematical equations, numerical problems, and logical puzzles.",
    options: createLikertOptions(
      "q1-math",
      { science: 6, commerce: 4, arts: 0, vocational: 1 },
      { science: 0, commerce: 1, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 2,
    classLevel: "10",
    category: "logic",
    question: "I like computers, coding, software applications, and understanding technological innovations.",
    options: createLikertOptions(
      "q2-tech-code",
      { science: 6, commerce: 2, arts: 0, vocational: 3 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 3,
    classLevel: "all",
    category: "logic",
    question: "I excel at discovering patterns in data sets, interpreting complex graphs, and drawing logical conclusions.",
    options: createLikertOptions(
      "q3-data-patterns",
      { science: 6, commerce: 5, arts: 1, vocational: 1 },
      { science: 0, commerce: 1, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 4,
    classLevel: "12",
    category: "logic",
    question: "I am fascinated by how artificial intelligence models, machine learning, and automated algorithms make decisions.",
    options: createLikertOptions(
      "q4-ai-algorithms",
      { science: 7, commerce: 3, arts: 0, vocational: 2 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 5,
    classLevel: "12",
    category: "logic",
    question: "I enjoy breaking down large multi-step challenges into smaller, systematic step-by-step procedures.",
    options: createLikertOptions(
      "q5-algorithmic-thinking",
      { science: 6, commerce: 4, arts: 1, vocational: 2 },
      { science: 0, commerce: 1, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 6,
    classLevel: "all",
    category: "logic",
    question: "I prefer working with structured databases, quantitative models, and clear logical rules.",
    options: createLikertOptions(
      "q6-databases-quant",
      { science: 5, commerce: 5, arts: 0, vocational: 1 },
      { science: 1, commerce: 1, arts: 4, vocational: 2 }
    ),
  },
  {
    order: 7,
    classLevel: "10",
    category: "logic",
    question: "I enjoy playing strategy games like chess, solving Sudoku, or tackling cryptic analytical brainteasers.",
    options: createLikertOptions(
      "q7-strategy-puzzles",
      { science: 5, commerce: 4, arts: 1, vocational: 1 },
      { science: 1, commerce: 1, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 8,
    classLevel: "12",
    category: "logic",
    question: "I am intrigued by cybersecurity, network encryption protocols, and data protection mechanisms.",
    options: createLikertOptions(
      "q8-cybersecurity",
      { science: 6, commerce: 3, arts: 0, vocational: 3 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 9,
    classLevel: "12",
    category: "logic",
    question: "I find financial mathematics, statistical probability, and quantitative risk calculations exciting.",
    options: createLikertOptions(
      "q9-financial-math",
      { science: 4, commerce: 7, arts: 0, vocational: 1 },
      { science: 2, commerce: 0, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 10,
    classLevel: "10",
    category: "logic",
    question: "I enjoy spatial reasoning, analyzing 3D geometric shapes, and understanding architectural or engineering blueprints.",
    options: createLikertOptions(
      "q10-spatial-3d",
      { science: 6, commerce: 1, arts: 2, vocational: 4 },
      { science: 0, commerce: 2, arts: 2, vocational: 1 }
    ),
  },
  {
    order: 11,
    classLevel: "all",
    category: "logic",
    question: "I like using complex formulas in spreadsheets to automate calculations, track metrics, or project outcomes.",
    options: createLikertOptions(
      "q11-excel-formulas",
      { science: 4, commerce: 6, arts: 1, vocational: 2 },
      { science: 2, commerce: 0, arts: 3, vocational: 1 }
    ),
  },

  // SCIENCE & ENGINEERING (q12 - q22)
  {
    order: 12,
    classLevel: "10",
    category: "science",
    question: "I find scientific experiments, physics principles, and chemical reactions intriguing.",
    options: createLikertOptions(
      "q12-physics-chem",
      { science: 7, commerce: 0, arts: 0, vocational: 2 },
      { science: 0, commerce: 2, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 13,
    classLevel: "10",
    category: "science",
    question: "I am interested in biological sciences, plant/animal physiology, and human anatomy.",
    options: createLikertOptions(
      "q13-bio-physiology",
      { science: 7, commerce: 0, arts: 1, vocational: 1 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 14,
    classLevel: "12",
    category: "science",
    question: "I am eager to learn how electronic circuits, microcontrollers, and robotics hardware work.",
    options: createLikertOptions(
      "q14-electronics-robotics",
      { science: 7, commerce: 1, arts: 0, vocational: 4 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 15,
    classLevel: "all",
    category: "science",
    question: "I enjoy researching astronomy, astrophysics, planetary science, and satellite technology.",
    options: createLikertOptions(
      "q15-astronomy-space",
      { science: 7, commerce: 0, arts: 1, vocational: 1 },
      { science: 0, commerce: 2, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 16,
    classLevel: "12",
    category: "science",
    question: "I am fascinated by genetics, DNA sequencing, gene editing, and biotechnological breakthroughs.",
    options: createLikertOptions(
      "q16-genetics-biotech",
      { science: 7, commerce: 0, arts: 1, vocational: 1 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 17,
    classLevel: "all",
    category: "science",
    question: "I am deeply passionate about environmental conservation, renewable energy systems, and climate science.",
    options: createLikertOptions(
      "q17-environmental-sci",
      { science: 6, commerce: 1, arts: 3, vocational: 2 },
      { science: 0, commerce: 2, arts: 1, vocational: 1 }
    ),
  },
  {
    order: 18,
    classLevel: "12",
    category: "science",
    question: "I am interested in medical diagnostics, pathology, pharmacology, and clinical patient care.",
    options: createLikertOptions(
      "q18-medical-care",
      { science: 7, commerce: 0, arts: 1, vocational: 2 },
      { science: 0, commerce: 3, arts: 2, vocational: 1 }
    ),
  },
  {
    order: 19,
    classLevel: "12",
    category: "science",
    question: "I enjoy studying organic chemistry, molecular structures, and industrial chemical formulations.",
    options: createLikertOptions(
      "q19-chem-formulation",
      { science: 7, commerce: 1, arts: 0, vocational: 2 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 20,
    classLevel: "10",
    category: "science",
    question: "I am curious about civil engineering, bridge design, structural dynamics, and urban infrastructure.",
    options: createLikertOptions(
      "q20-civil-eng",
      { science: 6, commerce: 1, arts: 1, vocational: 4 },
      { science: 0, commerce: 2, arts: 2, vocational: 1 }
    ),
  },
  {
    order: 21,
    classLevel: "12",
    category: "science",
    question: "I like understanding fluid dynamics, thermodynamics, engine mechanics, and aerospace propulsion.",
    options: createLikertOptions(
      "q21-aerospace-thermo",
      { science: 7, commerce: 1, arts: 0, vocational: 3 },
      { science: 0, commerce: 2, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 22,
    classLevel: "all",
    category: "science",
    question: "I am intrigued by agricultural sciences, soil chemistry, crop biotechnology, and sustainable farming.",
    options: createLikertOptions(
      "q22-agri-science",
      { science: 6, commerce: 2, arts: 1, vocational: 4 },
      { science: 0, commerce: 2, arts: 2, vocational: 1 }
    ),
  },

  // COMMERCE, FINANCE & BUSINESS (q23 - q33)
  {
    order: 23,
    classLevel: "10",
    category: "commerce",
    question: "I am interested in how companies make profits, stock markets, accounting, and financial management.",
    options: createLikertOptions(
      "q23-commerce-finance",
      { science: 0, commerce: 7, arts: 1, vocational: 1 },
      { science: 3, commerce: 0, arts: 2, vocational: 2 }
    ),
  },
  {
    order: 24,
    classLevel: "10",
    category: "commerce",
    question: "I would like to start my own commercial business, manage corporate teams, or analyze market trends.",
    options: createLikertOptions(
      "q24-business-mgmt",
      { science: 1, commerce: 7, arts: 1, vocational: 2 },
      { science: 2, commerce: 0, arts: 2, vocational: 2 }
    ),
  },
  {
    order: 25,
    classLevel: "12",
    category: "commerce",
    question: "I enjoy keeping track of balance sheets, ledger accounts, tax calculations, and corporate auditing.",
    options: createLikertOptions(
      "q25-accounting-audit",
      { science: 0, commerce: 7, arts: 0, vocational: 1 },
      { science: 3, commerce: 0, arts: 3, vocational: 2 }
    ),
  },
  {
    order: 26,
    classLevel: "12",
    category: "commerce",
    question: "I am interested in macroeconomic trends, inflation rates, interest policy, and international trade.",
    options: createLikertOptions(
      "q26-macro-economics",
      { science: 1, commerce: 7, arts: 3, vocational: 0 },
      { science: 2, commerce: 0, arts: 1, vocational: 2 }
    ),
  },
  {
    order: 27,
    classLevel: "all",
    category: "commerce",
    question: "I enjoy studying buyer psychology, digital marketing funnels, and corporate brand positioning strategies.",
    options: createLikertOptions(
      "q27-marketing-brand",
      { science: 1, commerce: 6, arts: 3, vocational: 2 },
      { science: 2, commerce: 0, arts: 1, vocational: 2 }
    ),
  },
  {
    order: 28,
    classLevel: "all",
    category: "commerce",
    question: "I am fascinated by global supply chains, e-commerce fulfillment networks, and inventory logistics.",
    options: createLikertOptions(
      "q28-supply-chain",
      { science: 2, commerce: 6, arts: 0, vocational: 3 },
      { science: 2, commerce: 0, arts: 3, vocational: 1 }
    ),
  },
  {
    order: 29,
    classLevel: "12",
    category: "commerce",
    question: "I like evaluating startup investment decks, stock equity valuation, and venture capital growth.",
    options: createLikertOptions(
      "q29-venture-capital",
      { science: 2, commerce: 7, arts: 1, vocational: 1 },
      { science: 2, commerce: 0, arts: 2, vocational: 2 }
    ),
  },
  {
    order: 30,
    classLevel: "all",
    category: "commerce",
    question: "I am interested in corporate negotiation, client sales pipelines, and closing business deals.",
    options: createLikertOptions(
      "q30-sales-negotiation",
      { science: 0, commerce: 7, arts: 2, vocational: 2 },
      { science: 3, commerce: 0, arts: 1, vocational: 2 }
    ),
  },
  {
    order: 31,
    classLevel: "10",
    category: "commerce",
    question: "I enjoy organizing team workloads, human resource management, and workplace leadership.",
    options: createLikertOptions(
      "q31-hr-leadership",
      { science: 1, commerce: 6, arts: 3, vocational: 2 },
      { science: 2, commerce: 0, arts: 1, vocational: 2 }
    ),
  },
  {
    order: 32,
    classLevel: "12",
    category: "commerce",
    question: "I am interested in legal compliance, company secretary duties, governance regulations, and corporate law.",
    options: createLikertOptions(
      "q32-corporate-law-cs",
      { science: 0, commerce: 6, arts: 4, vocational: 1 },
      { science: 3, commerce: 0, arts: 1, vocational: 2 }
    ),
  },
  {
    order: 33,
    classLevel: "all",
    category: "commerce",
    question: "I regularly follow business news, stock market updates, economic forecasts, and industry quarterly reports.",
    options: createLikertOptions(
      "q33-business-news",
      { science: 1, commerce: 7, arts: 1, vocational: 1 },
      { science: 3, commerce: 0, arts: 2, vocational: 2 }
    ),
  },

  // CREATIVITY & DESIGN (q34 - q44)
  {
    order: 34,
    classLevel: "10",
    category: "creativity",
    question: "I love creative expression, fine arts, illustration, creative writing, or visual design.",
    options: createLikertOptions(
      "q34-fine-arts",
      { science: 0, commerce: 1, arts: 7, vocational: 2 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 35,
    classLevel: "all",
    category: "creativity",
    question: "I enjoy designing digital user interfaces (UI), user experiences (UX), app mockups, and website layouts.",
    options: createLikertOptions(
      "q35-ui-ux-design",
      { science: 3, commerce: 2, arts: 6, vocational: 3 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 36,
    classLevel: "all",
    category: "creativity",
    question: "I am passionate about architectural design, interior decoration, lighting aesthetics, and spatial arrangement.",
    options: createLikertOptions(
      "q36-interior-architecture",
      { science: 3, commerce: 1, arts: 6, vocational: 4 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 37,
    classLevel: "12",
    category: "creativity",
    question: "I enjoy visual storytelling, video editing, cinematography techniques, and film direction.",
    options: createLikertOptions(
      "q37-film-video-editing",
      { science: 1, commerce: 2, arts: 7, vocational: 3 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 38,
    classLevel: "10",
    category: "creativity",
    question: "I like experimenting with color palettes, custom typography, brand identities, and logo creation.",
    options: createLikertOptions(
      "q38-graphic-branding",
      { science: 0, commerce: 3, arts: 7, vocational: 2 },
      { science: 3, commerce: 1, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 39,
    classLevel: "all",
    category: "creativity",
    question: "I am interested in 3D character modeling, game world design, animation, and visual effects (VFX).",
    options: createLikertOptions(
      "q39-3d-vfx-gaming",
      { science: 3, commerce: 1, arts: 6, vocational: 4 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 40,
    classLevel: "10",
    category: "creativity",
    question: "I enjoy fashion design, apparel styling, textile patterns, and visual merchandising.",
    options: createLikertOptions(
      "q40-fashion-textile",
      { science: 0, commerce: 3, arts: 6, vocational: 4 },
      { science: 3, commerce: 1, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 41,
    classLevel: "10",
    category: "creativity",
    question: "I am drawn to digital sketching, comic art, concept illustration, and character design.",
    options: createLikertOptions(
      "q41-concept-art",
      { science: 0, commerce: 1, arts: 7, vocational: 2 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 42,
    classLevel: "all",
    category: "creativity",
    question: "I like capturing moments through professional photography, photo retouching, and visual composition.",
    options: createLikertOptions(
      "q42-photography",
      { science: 1, commerce: 2, arts: 6, vocational: 4 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 43,
    classLevel: "12",
    category: "creativity",
    question: "I enjoy audio engineering, music composition, sound design, and podcast production.",
    options: createLikertOptions(
      "q43-music-sound",
      { science: 2, commerce: 1, arts: 7, vocational: 3 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 44,
    classLevel: "all",
    category: "creativity",
    question: "I am fascinated by industrial product design, ergonomic styling, and physical prototype creation.",
    options: createLikertOptions(
      "q44-product-industrial-design",
      { science: 3, commerce: 2, arts: 5, vocational: 5 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },

  // SOCIAL SCIENCES, LAW & HUMANITIES (q45 - q54)
  {
    order: 45,
    classLevel: "10",
    category: "social",
    question: "I am enthusiastic about history, world geography, psychology, and understanding social transformations.",
    options: createLikertOptions(
      "q45-humanities-history",
      { science: 1, commerce: 1, arts: 7, vocational: 1 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 46,
    classLevel: "10",
    category: "social",
    question: "I enjoy public speaking, debating ethical issues, policy analysis, and legal systems.",
    options: createLikertOptions(
      "q46-law-debate",
      { science: 0, commerce: 2, arts: 7, vocational: 1 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 47,
    classLevel: "12",
    category: "social",
    question: "I am interested in understanding human emotional behavior, mental health counseling, and clinical psychology.",
    options: createLikertOptions(
      "q47-psychology-counseling",
      { science: 2, commerce: 1, arts: 7, vocational: 1 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 48,
    classLevel: "12",
    category: "social",
    question: "I am passionate about constitutional law, legal research, courtroom advocacy, and human rights advocacy.",
    options: createLikertOptions(
      "q48-constitutional-law",
      { science: 0, commerce: 3, arts: 7, vocational: 1 },
      { science: 3, commerce: 1, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 49,
    classLevel: "12",
    category: "social",
    question: "I enjoy political science, international relations, foreign diplomacy, and global governance.",
    options: createLikertOptions(
      "q49-political-sci-diplomacy",
      { science: 0, commerce: 2, arts: 7, vocational: 1 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 50,
    classLevel: "all",
    category: "social",
    question: "I am driven to pursue public service careers (such as IAS/IPS/Civil Services) to solve civic and societal challenges.",
    options: createLikertOptions(
      "q50-civil-services",
      { science: 2, commerce: 2, arts: 7, vocational: 1 },
      { science: 2, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 51,
    classLevel: "all",
    category: "social",
    question: "I enjoy investigating news stories, conducting journalistic interviews, and reporting public affairs.",
    options: createLikertOptions(
      "q51-journalism-media",
      { science: 0, commerce: 2, arts: 7, vocational: 2 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 52,
    classLevel: "all",
    category: "social",
    question: "I am interested in sociology, community welfare projects, non-profit leadership, and social equality initiatives.",
    options: createLikertOptions(
      "q52-sociology-ngo",
      { science: 1, commerce: 1, arts: 7, vocational: 2 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 53,
    classLevel: "10",
    category: "social",
    question: "I enjoy studying ancient civilizations, archaeological discoveries, museum curation, and historical archives.",
    options: createLikertOptions(
      "q53-archaeology-history",
      { science: 1, commerce: 0, arts: 7, vocational: 1 },
      { science: 3, commerce: 3, arts: 0, vocational: 1 }
    ),
  },
  {
    order: 54,
    classLevel: "all",
    category: "social",
    question: "I am eager to master foreign languages, linguistics, literary translation, and cross-cultural communication.",
    options: createLikertOptions(
      "q54-linguistics-languages",
      { science: 0, commerce: 2, arts: 7, vocational: 1 },
      { science: 3, commerce: 2, arts: 0, vocational: 1 }
    ),
  },

  // PRACTICAL, VOCATIONAL & APPLIED SKILLS (q55 - q64)
  {
    order: 55,
    classLevel: "10",
    category: "practical",
    question: "I prefer hands-on practical work (assembling electronics, crafting, workshop tools) over pure textbook memorization.",
    options: createLikertOptions(
      "q55-practical-voc",
      { science: 2, commerce: 1, arts: 2, vocational: 7 },
      { science: 3, commerce: 3, arts: 2, vocational: 0 }
    ),
  },
  {
    order: 56,
    classLevel: "all",
    category: "practical",
    question: "I enjoy troubleshooting physical machinery, repairing electrical gadgets, and operating workshop tools.",
    options: createLikertOptions(
      "q56-machinery-repair",
      { science: 2, commerce: 1, arts: 0, vocational: 7 },
      { science: 3, commerce: 3, arts: 3, vocational: 0 }
    ),
  },
  {
    order: 57,
    classLevel: "all",
    category: "practical",
    question: "I am interested in hotel management, culinary arts, front office operations, and hospitality guest services.",
    options: createLikertOptions(
      "q57-hotel-hospitality",
      { science: 0, commerce: 3, arts: 2, vocational: 7 },
      { science: 3, commerce: 1, arts: 2, vocational: 0 }
    ),
  },
  {
    order: 58,
    classLevel: "12",
    category: "practical",
    question: "I enjoy hands-on paramedical tech support, medical lab testing, X-ray operation, and emergency clinical assistance.",
    options: createLikertOptions(
      "q58-paramedical-lab",
      { science: 4, commerce: 0, arts: 1, vocational: 7 },
      { science: 2, commerce: 3, arts: 2, vocational: 0 }
    ),
  },
  {
    order: 59,
    classLevel: "10",
    category: "practical",
    question: "I am interested in automotive engineering, vehicle mechanics, electric vehicle technology, and servicing.",
    options: createLikertOptions(
      "q59-automotive-mech",
      { science: 3, commerce: 1, arts: 0, vocational: 7 },
      { science: 2, commerce: 3, arts: 3, vocational: 0 }
    ),
  },
  {
    order: 60,
    classLevel: "all",
    category: "practical",
    question: "I enjoy working outdoors in agricultural farming, horticulture, plant nursery management, and landscaping.",
    options: createLikertOptions(
      "q60-farming-horticulture",
      { science: 3, commerce: 1, arts: 1, vocational: 7 },
      { science: 2, commerce: 3, arts: 2, vocational: 0 }
    ),
  },
  {
    order: 61,
    classLevel: "12",
    category: "practical",
    question: "I am interested in aviation, commercial flight operations, air traffic control, and aircraft maintenance.",
    options: createLikertOptions(
      "q61-aviation-flight",
      { science: 4, commerce: 2, arts: 0, vocational: 6 },
      { science: 2, commerce: 2, arts: 3, vocational: 0 }
    ),
  },
  {
    order: 62,
    classLevel: "10",
    category: "practical",
    question: "I enjoy carpentry, interior crafting, metal fabrication, and hands-on furniture creation.",
    options: createLikertOptions(
      "q62-carpentry-fabrication",
      { science: 1, commerce: 1, arts: 2, vocational: 7 },
      { science: 3, commerce: 3, arts: 2, vocational: 0 }
    ),
  },
  {
    order: 63,
    classLevel: "all",
    category: "practical",
    question: "I am interested in electrical installations, power grid wiring, renewable solar panel setup, and maintenance.",
    options: createLikertOptions(
      "q63-electrical-solar",
      { science: 3, commerce: 1, arts: 0, vocational: 7 },
      { science: 2, commerce: 3, arts: 3, vocational: 0 }
    ),
  },
  {
    order: 64,
    classLevel: "all",
    category: "practical",
    question: "I enjoy event logistics management, stage setups, sound/lighting venue assembly, and live event operations.",
    options: createLikertOptions(
      "q64-event-logistics",
      { science: 1, commerce: 3, arts: 2, vocational: 7 },
      { science: 3, commerce: 1, arts: 2, vocational: 0 }
    ),
  },
];


const sampleCourses = [
  {
    name: "B.Tech Computer Science and Engineering",
    slug: "btech-cse",
    level: "Undergraduate",
    duration: "4 years",
    eligibleStreams: ["Science"],
    overview: "Covers programming, algorithms, AI foundations, databases, and software systems.",
    subjects: ["Programming", "Data Structures", "Databases", "Operating Systems", "AI Basics"],
    careerOutcomes: ["Software Engineer", "Data Scientist", "AI Engineer"],
    exams: ["JEE Main", "JEE Advanced", "MHT-CET"],
    higherStudies: ["M.Tech", "MS", "MBA"],
    skillsLearned: ["Programming", "Problem Solving", "System Design", "Debugging"],
    studyMaterials: [{ title: "Programming Foundations", type: "Roadmap", link: "https://roadmap.sh/", language: "English" }],
  },
  {
    name: "BCA",
    slug: "bca",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Science", "Commerce", "Arts"],
    overview: "Build software and application development fundamentals with a practical computing focus.",
    subjects: ["Programming", "Web Development", "Databases", "Computer Networks"],
    careerOutcomes: ["Software Developer", "QA Engineer", "Web Developer"],
    exams: ["CUET UG", "University Entrance"],
    higherStudies: ["MCA", "M.Sc IT", "MBA"],
    skillsLearned: ["Coding", "Testing", "Web Development", "Database Design"],
    studyMaterials: [{ title: "App Development Starter", type: "Guide", link: "https://developer.mozilla.org/", language: "English" }],
  },
  {
    name: "B.Sc Computer Science",
    slug: "bsc-computer-science",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Science"],
    overview: "A theory-plus-practice path for computing, analytics, and research-oriented learners.",
    subjects: ["Programming", "Algorithms", "Statistics", "Operating Systems"],
    careerOutcomes: ["Research Assistant", "Data Analyst", "Software Developer"],
    exams: ["CUET UG", "State CET"],
    higherStudies: ["M.Sc Computer Science", "MCA", "PhD"],
    skillsLearned: ["Coding", "Analytical Thinking", "Research Methods", "Database Design"],
    studyMaterials: [{ title: "CS Foundations", type: "Guide", link: "https://ocw.mit.edu/", language: "English" }],
  },
  {
    name: "B.Com",
    slug: "bcom",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Commerce", "Arts"],
    overview: "Covers accounting, taxation, economics, business law, and financial reporting.",
    subjects: ["Accountancy", "Economics", "Taxation", "Business Law"],
    careerOutcomes: ["Accountant", "Financial Analyst", "Auditor"],
    exams: ["CUET UG"],
    higherStudies: ["M.Com", "MBA", "CA"],
    skillsLearned: ["Bookkeeping", "Financial Analysis", "Excel", "Business Communication"],
    studyMaterials: [{ title: "Finance Essentials", type: "Guide", link: "https://www.investopedia.com/", language: "English" }],
  },
  {
    name: "BBA",
    slug: "bba",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Commerce", "Science", "Arts"],
    overview: "Focuses on management, marketing, entrepreneurship, and business analytics.",
    subjects: ["Management", "Marketing", "HR", "Business Analytics"],
    careerOutcomes: ["Business Analyst", "Management Trainee", "Sales Manager"],
    exams: ["CUET UG", "IPMAT"],
    higherStudies: ["MBA", "PGDM"],
    skillsLearned: ["Leadership", "Presentation", "Business Thinking", "Teamwork"],
    studyMaterials: [{ title: "Business Starter Pack", type: "Podcast", link: "https://open.spotify.com/", language: "English" }],
  },
  {
    name: "Chartered Accountancy Path",
    slug: "chartered-accountancy",
    level: "Professional",
    duration: "4.5 years",
    eligibleStreams: ["Commerce", "Arts"],
    overview: "A professional path through CA Foundation, Intermediate, articleship, and Final.",
    subjects: ["Accounting", "Taxation", "Audit", "Corporate Law"],
    careerOutcomes: ["Chartered Accountant", "Tax Consultant", "Finance Manager"],
    exams: ["CA Foundation", "CA Intermediate", "CA Final"],
    higherStudies: ["CPA", "MBA Finance"],
    skillsLearned: ["Accounting", "Audit", "Tax Planning", "Compliance"],
    studyMaterials: [{ title: "CA Path Overview", type: "Guide", link: "https://www.icai.org/", language: "English" }],
  },
  {
    name: "BA Psychology",
    slug: "ba-psychology",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Arts", "Science"],
    overview: "Introduces human behavior, counseling basics, research methods, and cognition.",
    subjects: ["Psychology", "Research Methods", "Counseling", "Statistics"],
    careerOutcomes: ["Counselor", "HR Executive", "Behavioral Research Assistant"],
    exams: ["CUET UG"],
    higherStudies: ["MA Psychology", "MSW"],
    skillsLearned: ["Empathy", "Observation", "Research", "Interviewing"],
    studyMaterials: [{ title: "Mental Wellness Primer", type: "Article", link: "https://www.apa.org/", language: "English" }],
  },
  {
    name: "BA Journalism and Mass Communication",
    slug: "ba-journalism-mass-communication",
    level: "Undergraduate",
    duration: "3 years",
    eligibleStreams: ["Arts", "Commerce"],
    overview: "Builds reporting, media research, editing, and digital storytelling skills.",
    subjects: ["News Writing", "Digital Media", "Broadcasting", "Media Ethics"],
    careerOutcomes: ["Journalist", "Content Strategist", "PR Executive"],
    exams: ["CUET UG"],
    higherStudies: ["MA Mass Communication", "MBA Media Management"],
    skillsLearned: ["Storytelling", "Interviewing", "Editing", "Media Research"],
    studyMaterials: [{ title: "Writing for Media", type: "Course", link: "https://www.coursera.org/", language: "English" }],
  },
  {
    name: "LLB",
    slug: "llb",
    level: "Undergraduate / Professional",
    duration: "3 years",
    eligibleStreams: ["Arts", "Commerce", "Science"],
    overview: "Builds legal reasoning, constitutional understanding, and advocacy fundamentals.",
    subjects: ["Constitutional Law", "Criminal Law", "Contract Law", "Legal Research"],
    careerOutcomes: ["Lawyer", "Legal Analyst", "Judicial Services Aspirant"],
    exams: ["CLAT", "University Entrance"],
    higherStudies: ["LLM", "Judicial Services"],
    skillsLearned: ["Legal Reasoning", "Research", "Communication", "Argumentation"],
    studyMaterials: [{ title: "Legal Foundations", type: "Guide", link: "https://legalaffairs.gov.in/", language: "English" }],
  },
  {
    name: "MBBS",
    slug: "mbbs",
    level: "Undergraduate / Professional",
    duration: "5.5 years",
    eligibleStreams: ["Science"],
    overview: "The primary medical path for diagnosis, clinical care, and hospital practice.",
    subjects: ["Anatomy", "Physiology", "Biochemistry", "Clinical Rotations"],
    careerOutcomes: ["Doctor", "Medical Officer", "Clinical Specialist"],
    exams: ["NEET UG"],
    higherStudies: ["MD", "MS", "DNB"],
    skillsLearned: ["Clinical Observation", "Patient Care", "Medical Ethics", "Decision Making"],
    studyMaterials: [{ title: "Medical Entrance Prep", type: "Guide", link: "https://www.nmc.org.in/", language: "English" }],
  },
  {
    name: "B.Sc Nursing",
    slug: "bsc-nursing",
    level: "Undergraduate",
    duration: "4 years",
    eligibleStreams: ["Science"],
    overview: "Prepares students for nursing care, hospital systems, and patient management.",
    subjects: ["Nursing Foundations", "Anatomy", "Community Health", "Clinical Practice"],
    careerOutcomes: ["Nurse", "Clinical Coordinator", "Public Health Nurse"],
    exams: ["NEET UG", "Institute Entrance"],
    higherStudies: ["M.Sc Nursing", "Hospital Administration"],
    skillsLearned: ["Patient Care", "Observation", "Coordination", "Documentation"],
    studyMaterials: [{ title: "Nursing Pathway Guide", type: "Guide", link: "https://www.indiannursingcouncil.org/", language: "English" }],
  },
  {
    name: "Diploma in Graphic Design",
    slug: "diploma-graphic-design",
    level: "Diploma",
    duration: "1 year",
    eligibleStreams: ["Vocational", "Arts", "Commerce"],
    overview: "A design-focused diploma for branding, visual systems, and digital creatives.",
    subjects: ["Typography", "Branding", "Illustration", "Layout Design"],
    careerOutcomes: ["Graphic Designer", "UI UX Designer", "Brand Designer"],
    exams: ["Institute-specific admission"],
    higherStudies: ["B.Des", "Advanced Design Diploma"],
    skillsLearned: ["Adobe Tools", "Design Thinking", "Visual Communication"],
    studyMaterials: [{ title: "Design Inspiration", type: "Gallery", link: "https://www.behance.net/", language: "English" }],
  },
  {
    name: "Diploma in Hotel Management",
    slug: "diploma-hotel-management",
    level: "Diploma",
    duration: "1.5 years",
    eligibleStreams: ["Vocational", "Arts", "Commerce"],
    overview: "Develops hospitality operations, food service, and guest relations skills.",
    subjects: ["Hospitality Basics", "Front Office", "Food Production", "Service Skills"],
    careerOutcomes: ["Hotel Manager", "Guest Relations Associate", "Restaurant Supervisor"],
    exams: ["NCHMCT JEE", "Institute-specific admission"],
    higherStudies: ["BHM", "MBA Hospitality"],
    skillsLearned: ["Communication", "Service Operations", "Team Coordination"],
    studyMaterials: [{ title: "Hospitality Skills", type: "Video", link: "https://www.youtube.com/", language: "English" }],
  },
  {
    name: "Bachelor of Dental Surgery (BDS)",
    slug: "bds",
    level: "Undergraduate / Professional",
    duration: "5 years",
    eligibleStreams: ["Science"],
    overview: "Covers oral health, dental surgery, diagnosis, and care.",
    subjects: ["Anatomy", "Dental Materials", "Oral Pathology", "Clinical Practice"],
    careerOutcomes: ["Dentist", "Dental Surgeon"],
    exams: ["NEET UG"],
    higherStudies: ["MDS"],
    skillsLearned: ["Dental Surgery", "Patient Care", "Precision"],
    studyMaterials: [{ title: "Dental Anatomy Intro", type: "Guide", link: "https://www.dciindia.gov.in/", language: "English" }],
  },
  {
    name: "Bachelor of Pharmacy (B.Pharm)",
    slug: "bpharm",
    level: "Undergraduate",
    duration: "4 years",
    eligibleStreams: ["Science"],
    overview: "Covers drug formulation, pharmacology, clinical pharmacy, and pharmaceutical chemistry.",
    subjects: ["Pharmacology", "Pharmaceutics", "Pharmaceutical Chemistry", "Pharmacognosy"],
    careerOutcomes: ["Pharmacist", "Drug Inspector", "Chemical Analyst"],
    exams: ["NEET UG", "MHT-CET", "State CET"],
    higherStudies: ["M.Pharm", "MBA Pharma"],
    skillsLearned: ["Drug Formulation", "Chemical Analysis", "Clinical Research"],
    studyMaterials: [{ title: "Pharmacy Practice Guide", type: "Guide", link: "https://www.pci.nic.in/", language: "English" }],
  },
  {
    name: "Bachelor of Architecture (B.Arch)",
    slug: "barch",
    level: "Undergraduate",
    duration: "5 years",
    eligibleStreams: ["Science"],
    overview: "Covers architectural design, building construction, planning, and structural systems.",
    subjects: ["Architectural Design", "Building Construction", "Theory of Structures", "Urban Planning"],
    careerOutcomes: ["Architect", "Urban Planner", "Interior Designer"],
    exams: ["NATA", "JEE Main Paper 2"],
    higherStudies: ["M.Arch", "Master of Design"],
    skillsLearned: ["CAD Drawing", "Structural Planning", "Visual Design", "Spatial Thinking"],
    studyMaterials: [{ title: "Architecture Design Principles", type: "Guide", link: "https://www.coa.gov.in/", language: "English" }],
  },
  {
    name: "Diploma in Paramedical Technology",
    slug: "paramedical-diploma",
    level: "Diploma",
    duration: "2 years",
    eligibleStreams: ["Science", "Vocational"],
    overview: "Covers laboratory techniques, radiology, emergency medical care, and clinical support.",
    subjects: ["Clinical Biochemistry", "Radiology Basics", "Hematology", "Emergency Care"],
    careerOutcomes: ["Lab Technician", "Radiology Technician", "OT Assistant"],
    exams: ["State Board Entrance"],
    higherStudies: ["B.Sc Paramedical", "Specialization Certs"],
    skillsLearned: ["Lab Testing", "Radiography", "Patient Support", "Clinical Observation"],
    studyMaterials: [{ title: "Lab Technician Handbook", type: "Guide", link: "https://www.who.int/", language: "English" }],
  },
];

const sampleDeadlines = [
  {
    title: "CUET UG Application Window",
    category: "Entrance Test",
    date: new Date("2026-07-10"),
    state: "National",
    relatedCourse: "Multiple UG Courses",
    reminderRule: "7 days before",
    source: { label: "Public application calendar", url: "https://example.com/cuet", lastVerifiedAt: new Date("2026-05-20") },
  },
  {
    title: "MHT-CET Counseling Registration",
    category: "Counseling",
    date: new Date("2026-07-22"),
    state: "Maharashtra",
    relatedCourse: "Engineering and Pharmacy",
    reminderRule: "3 days before",
    source: { label: "State counseling notice", url: "https://example.com/cet", lastVerifiedAt: new Date("2026-05-21") },
  },
  {
    title: "National Merit Scholarship Upload Deadline",
    category: "Scholarship",
    date: new Date("2026-08-05"),
    state: "National",
    relatedCourse: "Any UG Program",
    reminderRule: "5 days before",
    source: { label: "Scholarship bulletin", url: "https://example.com/scholarship", lastVerifiedAt: new Date("2026-05-19") },
  },
];

const roadmapNodes = [
  { nodeId: "after-10th", label: "After 10th", category: "stage", depth: 0, stage: "After 10th", summary: "The starting point for major higher-secondary and vocational pathways.", visibleIn: ["public", "personalized"], position: { x: 40, y: 260 } },
  { nodeId: "science-stream", label: "Science", category: "stream", depth: 1, stage: "Higher Secondary", summary: "For students interested in math, biology, research, and technical pathways.", visibleIn: ["public", "personalized"], position: { x: 280, y: 70 } },
  { nodeId: "commerce-stream", label: "Commerce", category: "stream", depth: 1, stage: "Higher Secondary", summary: "For business, accounting, economics, and management-oriented routes.", visibleIn: ["public", "personalized"], position: { x: 280, y: 250 } },
  { nodeId: "arts-stream", label: "Arts", category: "stream", depth: 1, stage: "Higher Secondary", summary: "For humanities, communication, social sciences, law, and public service.", visibleIn: ["public", "personalized"], position: { x: 280, y: 430 } },
  { nodeId: "polytechnic", label: "Polytechnic Diploma", category: "stage", depth: 1, stage: "Vocational", summary: "A practical diploma path after 10th for engineering and technical roles.", visibleIn: ["public"], position: { x: 280, y: 610 } },
  { nodeId: "iti", label: "ITI", category: "stage", depth: 1, stage: "Vocational", summary: "Hands-on technical training through trade-focused certificates.", visibleIn: ["public"], position: { x: 280, y: 790 } },
  { nodeId: "12th-science-pcm", label: "12th Science PCM", category: "stage", depth: 2, stage: "Class 12", summary: "Physics, Chemistry, Mathematics pathway for engineering and computing.", requiredStream: "Science", visibleIn: ["public", "personalized"], position: { x: 560, y: 20 } },
  { nodeId: "science-pcm", label: "PCM", category: "stream", depth: 2, stage: "Science Specialization", summary: "Mathematics-focused science combination for engineering, NDA, and technical degrees.", requiredStream: "Science", visibleIn: ["public", "personalized"], position: { x: 560, y: 120 } },
  { nodeId: "science-pcb", label: "PCB", category: "stream", depth: 2, stage: "Science Specialization", summary: "Biology-focused science combination for medicine, nursing, and allied health.", requiredStream: "Science", visibleIn: ["public"], position: { x: 560, y: 220 } },
  { nodeId: "12th-commerce", label: "12th Commerce", category: "stage", depth: 2, stage: "Class 12", summary: "Commerce route for business, accounting, finance, and management studies.", requiredStream: "Commerce", visibleIn: ["public", "personalized"], position: { x: 560, y: 340 } },
  { nodeId: "12th-arts", label: "12th Arts", category: "stage", depth: 2, stage: "Class 12", summary: "Humanities route for law, media, psychology, and public service tracks.", requiredStream: "Arts", visibleIn: ["public", "personalized"], position: { x: 560, y: 500 } },
  { nodeId: "open-school", label: "Open School", category: "stage", depth: 2, stage: "Alternative Route", summary: "Flexible schooling route that keeps later degree and vocational options open.", visibleIn: ["public"], position: { x: 560, y: 690 } },
  { nodeId: "btech-cse", label: "B.Tech CSE", category: "course", depth: 3, stage: "Undergraduate", duration: "4 years", fees: "INR 50k - 15L", requiredStream: "PCM", entranceExams: ["JEE Main", "JEE Advanced", "MHT-CET"], skills: ["Programming", "Problem Solving"], careerOptions: ["Software Engineer", "AI Engineer"], summary: "A flagship engineering route into software, AI, and advanced computing careers.", visibleIn: ["public", "personalized"], position: { x: 900, y: 10 } },
  { nodeId: "bca", label: "BCA", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 40k - 3L", requiredStream: "Any stream", entranceExams: ["CUET UG", "University Entrance"], skills: ["Programming", "Web Development"], careerOptions: ["Software Developer", "QA Engineer"], summary: "A flexible computing degree that suits students from multiple streams.", visibleIn: ["public", "personalized"], position: { x: 900, y: 110 } },
  { nodeId: "bsc", label: "B.Sc", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 20k - 2L", requiredStream: "Science", entranceExams: ["CUET UG"], skills: ["Research", "Analytical Thinking"], careerOptions: ["Research Scientist", "Professor"], summary: "A broad science pathway that supports research and academic careers.", visibleIn: ["public"], position: { x: 900, y: 210 } },
  { nodeId: "nda", label: "NDA", category: "exam", depth: 3, stage: "Defence Entry", duration: "3 years training", fees: "Sponsored", requiredStream: "PCM preferred for Air Force / Navy", entranceExams: ["NDA Exam"], skills: ["Discipline", "Leadership"], careerOptions: ["Armed Forces"], summary: "A national defence route for Army, Navy, and Air Force entry.", visibleIn: ["public"], position: { x: 900, y: 310 } },
  { nodeId: "mbbs", label: "MBBS", category: "course", depth: 3, stage: "Undergraduate", duration: "5.5 years", fees: "INR 50k - 25L", requiredStream: "PCB", entranceExams: ["NEET UG"], skills: ["Clinical Observation", "Patient Care"], careerOptions: ["Doctor"], summary: "The core medical degree for becoming a physician or specialist.", visibleIn: ["public"], position: { x: 900, y: 410 } },
  { nodeId: "bsc-nursing", label: "B.Sc Nursing", category: "course", depth: 3, stage: "Undergraduate", duration: "4 years", fees: "INR 40k - 5L", requiredStream: "PCB", entranceExams: ["NEET UG", "Institute Entrance"], skills: ["Patient Care", "Observation"], careerOptions: ["Nurse"], summary: "A healthcare route for hospital, clinic, and public-health roles.", visibleIn: ["public"], position: { x: 900, y: 510 } },
  { nodeId: "bcom", label: "B.Com", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 20k - 2L", requiredStream: "Commerce", entranceExams: ["CUET UG"], skills: ["Accounting", "Analysis"], careerOptions: ["Accountant", "Financial Analyst"], summary: "The classic undergraduate commerce degree for accounting and finance tracks.", visibleIn: ["public"], position: { x: 900, y: 610 } },
  { nodeId: "bba", label: "BBA", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 60k - 6L", requiredStream: "Any stream", entranceExams: ["CUET UG", "IPMAT"], skills: ["Leadership", "Presentation"], careerOptions: ["Business Analyst", "Management Trainee"], summary: "A management-oriented undergraduate route for business careers.", visibleIn: ["public", "personalized"], position: { x: 900, y: 710 } },
  { nodeId: "chartered-accountancy", label: "CA", category: "course", depth: 3, stage: "Professional", duration: "4.5 years", fees: "Moderate", requiredStream: "Commerce preferred", entranceExams: ["CA Foundation"], skills: ["Accounting", "Taxation"], careerOptions: ["Chartered Accountant"], summary: "A high-value professional route in accounting, audit, and finance.", visibleIn: ["public", "personalized"], position: { x: 900, y: 810 } },
  { nodeId: "company-secretary", label: "CS", category: "course", depth: 3, stage: "Professional", duration: "3-4 years", fees: "Moderate", requiredStream: "Commerce / Arts", entranceExams: ["CSEET"], skills: ["Compliance", "Corporate Law"], careerOptions: ["Company Secretary"], summary: "A corporate governance and compliance specialization pathway.", visibleIn: ["public"], position: { x: 900, y: 910 } },
  { nodeId: "cost-accountancy", label: "CMA", category: "course", depth: 3, stage: "Professional", duration: "3-4 years", fees: "Moderate", requiredStream: "Commerce", entranceExams: ["CMA Foundation"], skills: ["Costing", "Accounting"], careerOptions: ["Cost Accountant"], summary: "A commerce specialization focused on costing, management accounting, and controls.", visibleIn: ["public"], position: { x: 900, y: 1010 } },
  { nodeId: "ba", label: "BA", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 20k - 2L", requiredStream: "Arts", entranceExams: ["CUET UG"], skills: ["Critical Thinking", "Writing"], careerOptions: ["Teacher", "Policy Analyst"], summary: "A broad humanities degree supporting education, policy, and social science careers.", visibleIn: ["public"], position: { x: 900, y: 1110 } },
  { nodeId: "journalism", label: "Journalism", category: "course", depth: 3, stage: "Undergraduate", duration: "3 years", fees: "INR 50k - 5L", requiredStream: "Arts / Commerce", entranceExams: ["CUET UG"], skills: ["Storytelling", "Interviewing"], careerOptions: ["Journalist", "Editor"], summary: "A media and communication path for reporting, content, and broadcasting careers.", visibleIn: ["public", "personalized"], position: { x: 900, y: 1210 } },
  { nodeId: "llb", label: "Law", category: "course", depth: 3, stage: "Undergraduate / Professional", duration: "5 years integrated / 3 years", fees: "INR 50k - 10L", requiredStream: "Any stream", entranceExams: ["CLAT"], skills: ["Reasoning", "Argumentation"], careerOptions: ["Lawyer", "Legal Analyst"], summary: "A legal studies pathway for advocacy, corporate law, and judiciary tracks.", visibleIn: ["public", "personalized"], position: { x: 900, y: 1310 } },
  { nodeId: "civil-services", label: "UPSC / Civil Services", category: "career", depth: 4, stage: "Career Goal", duration: "Long-term", fees: "Varies", requiredStream: "Any stream", entranceExams: ["UPSC CSE"], skills: ["General Awareness", "Writing", "Decision Making"], careerOptions: ["IAS", "IPS", "IFS"], summary: "A public-service pathway built on broad academic preparation and exam strategy.", visibleIn: ["public", "personalized"], position: { x: 1260, y: 1330 } },
  { nodeId: "diploma-design", label: "Design / Animation", category: "course", depth: 3, stage: "Diploma", duration: "1-4 years", fees: "INR 40k - 6L", requiredStream: "Any stream", entranceExams: ["NID DAT", "NIFT"], skills: ["Visual Design", "Creativity"], careerOptions: ["UI UX Designer", "Graphic Designer"], summary: "Creative pathway for digital design, branding, and visual storytelling careers.", visibleIn: ["public"], position: { x: 900, y: 1410 } },
  { nodeId: "hotel-management", label: "Hotel Management", category: "course", depth: 3, stage: "Diploma / Degree", duration: "1.5-4 years", fees: "INR 60k - 4L", requiredStream: "Any stream", entranceExams: ["NCHMCT JEE"], skills: ["Service Operations", "Communication"], careerOptions: ["Hotel Manager"], summary: "Hospitality route for hotels, tourism, restaurants, and guest services.", visibleIn: ["public"], position: { x: 900, y: 1510 } },
  { nodeId: "agriculture", label: "Agriculture", category: "course", depth: 3, stage: "Undergraduate", duration: "4 years", fees: "INR 30k - 4L", requiredStream: "Science", entranceExams: ["CUET UG", "State CET"], skills: ["Field Research", "Biology"], careerOptions: ["Agricultural Scientist"], summary: "Agriculture and allied sciences pathway for farm systems and agri innovation.", visibleIn: ["public"], position: { x: 900, y: 1610 } },
  { nodeId: "veterinary", label: "Veterinary", category: "course", depth: 3, stage: "Undergraduate", duration: "5.5 years", fees: "INR 40k - 6L", requiredStream: "PCB", entranceExams: ["NEET UG", "State Veterinary Entrance"], skills: ["Animal Care", "Observation"], careerOptions: ["Veterinarian"], summary: "Animal health pathway for clinical, farm, and research careers.", visibleIn: ["public"], position: { x: 900, y: 1710 } },
  { nodeId: "software-engineer", label: "Software Engineer", category: "career", depth: 4, stage: "Career", summary: "Builds applications, services, and systems across software teams.", skills: ["Programming", "Problem Solving"], visibleIn: ["public", "personalized"], position: { x: 1260, y: 40 } },
  { nodeId: "data-scientist", label: "Data Scientist", category: "career", depth: 4, stage: "Career", summary: "Applies data analysis, ML, and experimentation to product and business problems.", skills: ["Statistics", "Python", "Machine Learning"], visibleIn: ["public"], position: { x: 1260, y: 130 } },
  { nodeId: "ai-engineer", label: "AI Engineer", category: "career", depth: 4, stage: "Career", summary: "Designs and ships AI-powered systems and intelligent applications.", skills: ["AI", "Programming", "Data"], visibleIn: ["public"], position: { x: 1260, y: 220 } },
  { nodeId: "research-scientist", label: "Research Scientist", category: "career", depth: 4, stage: "Career", summary: "Works on advanced scientific inquiry across labs, academia, or R&D.", skills: ["Research", "Analysis"], visibleIn: ["public"], position: { x: 1260, y: 310 } },
  { nodeId: "professor", label: "Professor", category: "career", depth: 4, stage: "Career", summary: "Academic teaching and research role in higher education.", skills: ["Teaching", "Research"], visibleIn: ["public"], position: { x: 1260, y: 400 } },
  { nodeId: "armed-forces", label: "Armed Forces", category: "career", depth: 4, stage: "Career", summary: "A defence services path built on discipline, leadership, and service.", skills: ["Leadership", "Discipline"], visibleIn: ["public"], position: { x: 1260, y: 490 } },
  { nodeId: "doctor", label: "Doctor", category: "career", depth: 4, stage: "Career", summary: "Medical diagnosis, treatment, and patient care across specializations.", skills: ["Clinical Care", "Decision Making"], visibleIn: ["public"], position: { x: 1260, y: 580 } },
  { nodeId: "nurse", label: "Nurse", category: "career", depth: 4, stage: "Career", summary: "Patient care and clinical coordination in healthcare settings.", skills: ["Observation", "Patient Care"], visibleIn: ["public"], position: { x: 1260, y: 670 } },
  { nodeId: "chartered-accountant", label: "Chartered Accountant", category: "career", depth: 4, stage: "Career", summary: "Professional finance role in audit, taxation, and corporate accounts.", skills: ["Accounting", "Audit"], visibleIn: ["public", "personalized"], position: { x: 1260, y: 760 } },
  { nodeId: "company-secretary-career", label: "Company Secretary", category: "career", depth: 4, stage: "Career", summary: "Corporate governance and compliance specialist role.", skills: ["Corporate Law", "Compliance"], visibleIn: ["public"], position: { x: 1260, y: 850 } },
  { nodeId: "cost-accountant", label: "Cost Accountant", category: "career", depth: 4, stage: "Career", summary: "Specialist finance role in costing, controls, and planning.", skills: ["Costing", "Analysis"], visibleIn: ["public"], position: { x: 1260, y: 940 } },
  { nodeId: "journalist", label: "Journalist", category: "career", depth: 4, stage: "Career", summary: "Reporting and storytelling role across digital, print, and broadcast media.", skills: ["Reporting", "Writing"], visibleIn: ["public", "personalized"], position: { x: 1260, y: 1030 } },
  { nodeId: "lawyer", label: "Lawyer", category: "career", depth: 4, stage: "Career", summary: "Legal practice role in litigation, advisory, or corporate law.", skills: ["Reasoning", "Advocacy"], visibleIn: ["public", "personalized"], position: { x: 1260, y: 1120 } },
  { nodeId: "uiux-designer", label: "UI UX Designer", category: "career", depth: 4, stage: "Career", summary: "Designs digital experiences, interfaces, and product journeys.", skills: ["Design Thinking", "Wireframing"], visibleIn: ["public"], position: { x: 1260, y: 1210 } },
  { nodeId: "hotel-manager", label: "Hotel Manager", category: "career", depth: 4, stage: "Career", summary: "Leads guest services, operations, and hospitality teams.", skills: ["Service Management", "Communication"], visibleIn: ["public"], position: { x: 1260, y: 1300 } },
  { nodeId: "agricultural-scientist", label: "Agricultural Scientist", category: "career", depth: 4, stage: "Career", summary: "Works in crop systems, agricultural research, and agri innovation.", skills: ["Biology", "Field Research"], visibleIn: ["public"], position: { x: 1260, y: 1390 } },
  { nodeId: "veterinarian", label: "Veterinarian", category: "career", depth: 4, stage: "Career", summary: "Animal care and clinical health specialist.", skills: ["Animal Care", "Clinical Observation"], visibleIn: ["public"], position: { x: 1260, y: 1480 } },
  { nodeId: "mca", label: "MCA", category: "milestone", depth: 4, stage: "Higher Studies", duration: "2 years", summary: "A postgraduate computing upgrade after BCA or related degrees.", visibleIn: ["personalized"], position: { x: 1260, y: 1570 } },
  { nodeId: "mba", label: "MBA", category: "milestone", depth: 4, stage: "Higher Studies", duration: "2 years", summary: "A business leadership upgrade after BBA or another undergraduate route.", visibleIn: ["personalized"], position: { x: 1260, y: 1660 } },
  { nodeId: "tech-internship", label: "Internship", category: "milestone", depth: 4, stage: "Milestone", summary: "Industry exposure through projects, internships, and work-integrated learning.", visibleIn: ["personalized"], position: { x: 1260, y: 1750 } },
  { nodeId: "senior-engineer", label: "Senior Engineer", category: "milestone", depth: 5, stage: "Growth Milestone", summary: "Progression step after hands-on engineering delivery experience.", visibleIn: ["personalized"], position: { x: 1560, y: 40 } },
  { nodeId: "tech-lead", label: "Tech Lead", category: "milestone", depth: 6, stage: "Growth Milestone", summary: "Leadership milestone for product architecture, delivery, and mentoring.", visibleIn: ["personalized"], position: { x: 1820, y: 40 } },
  { nodeId: "business-analyst", label: "Business Analyst", category: "career", depth: 5, stage: "Career", summary: "Bridges business goals and execution through analysis and planning.", visibleIn: ["personalized"], position: { x: 1560, y: 1660 } },
  { nodeId: "product-manager", label: "Product Manager", category: "milestone", depth: 6, stage: "Growth Milestone", summary: "Owns product strategy, prioritization, and execution across teams.", visibleIn: ["personalized"], position: { x: 1820, y: 1660 } },
  { nodeId: "finance-manager", label: "Finance Manager", category: "milestone", depth: 5, stage: "Growth Milestone", summary: "A leadership finance role after accounting and business experience.", visibleIn: ["personalized"], position: { x: 1560, y: 760 } },
  { nodeId: "editor", label: "Editor", category: "milestone", depth: 5, stage: "Growth Milestone", summary: "A senior media role focused on editorial quality and content direction.", visibleIn: ["personalized"], position: { x: 1560, y: 1030 } },
  { nodeId: "bds", label: "BDS", category: "course", depth: 3, stage: "Undergraduate", duration: "5 years", fees: "INR 1L - 6L / year", requiredStream: "PCB", entranceExams: ["NEET UG"], skills: ["Precision", "Dental Surgery"], careerOptions: ["Dentist"], summary: "Professional dental surgery path.", visibleIn: ["public", "personalized"], position: { x: 900, y: 1810 } },
  { nodeId: "bpharm", label: "B.Pharm", category: "course", depth: 3, stage: "Undergraduate", duration: "4 years", fees: "INR 60k - 2L / year", requiredStream: "Science", entranceExams: ["MHT-CET", "State CET"], skills: ["Drug Formulation", "Chemical Analysis"], careerOptions: ["Pharmacist"], summary: "Undergraduate pharmacy education path.", visibleIn: ["public", "personalized"], position: { x: 900, y: 1910 } },
  { nodeId: "barch", label: "B.Arch", category: "course", depth: 3, stage: "Undergraduate", duration: "5 years", fees: "INR 80k - 3L / year", requiredStream: "PCM", entranceExams: ["NATA", "JEE Main"], skills: ["CAD Drawing", "Spatial Design"], careerOptions: ["Architect"], summary: "Undergraduate architectural planning degree.", visibleIn: ["public", "personalized"], position: { x: 900, y: 2010 } },
  { nodeId: "paramedical-diploma", label: "Paramedical Diploma", category: "course", depth: 3, stage: "Diploma", duration: "2 years", fees: "INR 20k - 80k / year", requiredStream: "Science", entranceExams: ["State Entrance"], skills: ["Lab Testing", "Radiography"], careerOptions: ["Lab Technician"], summary: "Diploma in medical laboratory and support techs.", visibleIn: ["public"], position: { x: 900, y: 2110 } },
  { nodeId: "dentist", label: "Dentist", category: "career", depth: 4, stage: "Career", summary: "Clinical dentist or surgeon diagnosing oral issues.", skills: ["Precision", "Patient Care"], visibleIn: ["public"], position: { x: 1260, y: 1810 } },
  { nodeId: "pharmacist", label: "Pharmacist", category: "career", depth: 4, stage: "Career", summary: "Dispensing medicines, chemical testing, and quality control.", skills: ["Drug Knowledge", "Attention to Detail"], visibleIn: ["public"], position: { x: 1260, y: 1910 } },
  { nodeId: "architect", label: "Architect", category: "career", depth: 4, stage: "Career", summary: "Designs buildings, structures, and interior spaces.", skills: ["Design", "CAD Drawing"], visibleIn: ["public"], position: { x: 1260, y: 2010 } },
  { nodeId: "lab-technician", label: "Lab Technician", category: "career", depth: 4, stage: "Career", summary: "Conducts blood and chemical tests in diagnostic labs.", skills: ["Lab Operations", "Clinical Chemistry"], visibleIn: ["public"], position: { x: 1260, y: 2110 } },
  { nodeId: "civil-engineer", label: "Civil Engineer", category: "career", depth: 4, stage: "Career", summary: "Plans and designs roads, bridges, and infrastructure.", skills: ["Physics", "Construction Planning"], visibleIn: ["public"], position: { x: 1260, y: 2210 } },
  { nodeId: "pilot", label: "Pilot", category: "career", depth: 4, stage: "Career", summary: "Operates aircraft for commercial airlines or defence.", skills: ["Spatial Awareness", "Crisis Management"], visibleIn: ["public"], position: { x: 1260, y: 2310 } },
  { nodeId: "police-officer", label: "Police Officer", category: "career", depth: 4, stage: "Career", summary: "Enforces law, maintains public order, and investigates crimes.", skills: ["Crisis Management", "Law Enforcement"], visibleIn: ["public"], position: { x: 1260, y: 2410 } },
  { nodeId: "graphic-designer", label: "Graphic Designer", category: "career", depth: 4, stage: "Career", summary: "Creates visuals, brand assets, and digital art.", skills: ["Creativity", "Visual Software"], visibleIn: ["public"], position: { x: 1260, y: 2510 } },
  { nodeId: "teacher", label: "Teacher", category: "career", depth: 4, stage: "Career", summary: "Teaches primary or secondary school students.", skills: ["Communication", "Pedagogy"], visibleIn: ["public"], position: { x: 1260, y: 2610 } },
];

const roadmapEdges = [
  { edgeId: "after10-science", sourceId: "after-10th", targetId: "science-stream", label: "Choose stream", visibleIn: ["public"] },
  { edgeId: "after10-commerce", sourceId: "after-10th", targetId: "commerce-stream", label: "Choose stream", visibleIn: ["public"] },
  { edgeId: "after10-arts", sourceId: "after-10th", targetId: "arts-stream", label: "Choose stream", visibleIn: ["public"] },
  { edgeId: "after10-polytechnic", sourceId: "after-10th", targetId: "polytechnic", label: "Vocational option", visibleIn: ["public"] },
  { edgeId: "after10-iti", sourceId: "after-10th", targetId: "iti", label: "Vocational option", visibleIn: ["public"] },
  { edgeId: "science-pcm-edge", sourceId: "science-stream", targetId: "science-pcm", label: "Specialize", visibleIn: ["public"] },
  { edgeId: "science-pcb-edge", sourceId: "science-stream", targetId: "science-pcb", label: "Specialize", visibleIn: ["public"] },
  { edgeId: "science-12-edge", sourceId: "science-stream", targetId: "12th-science-pcm", label: "Continue to 12th", visibleIn: ["public"] },
  { edgeId: "commerce-12-edge", sourceId: "commerce-stream", targetId: "12th-commerce", label: "Continue to 12th", visibleIn: ["public"] },
  { edgeId: "arts-12-edge", sourceId: "arts-stream", targetId: "12th-arts", label: "Continue to 12th", visibleIn: ["public"] },
  { edgeId: "iti-open-school-edge", sourceId: "iti", targetId: "open-school", label: "Alternative progression", visibleIn: ["public"] },
  { edgeId: "polytechnic-open-school-edge", sourceId: "polytechnic", targetId: "open-school", label: "Alternative progression", visibleIn: ["public"] },
  { edgeId: "pcm-btech", sourceId: "science-pcm", targetId: "btech-cse", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcm-bca", sourceId: "science-pcm", targetId: "bca", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcm-bsc", sourceId: "science-pcm", targetId: "bsc", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcm-nda", sourceId: "science-pcm", targetId: "nda", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcb-mbbs", sourceId: "science-pcb", targetId: "mbbs", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcb-nursing", sourceId: "science-pcb", targetId: "bsc-nursing", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcb-agriculture", sourceId: "science-pcb", targetId: "agriculture", label: "Can take", visibleIn: ["public"] },
  { edgeId: "pcb-veterinary", sourceId: "science-pcb", targetId: "veterinary", label: "Can take", visibleIn: ["public"] },
  { edgeId: "commerce-bcom", sourceId: "12th-commerce", targetId: "bcom", label: "Can take", visibleIn: ["public"] },
  { edgeId: "commerce-bba", sourceId: "12th-commerce", targetId: "bba", label: "Can take", visibleIn: ["public"] },
  { edgeId: "commerce-ca", sourceId: "12th-commerce", targetId: "chartered-accountancy", label: "Professional route", visibleIn: ["public"] },
  { edgeId: "commerce-cs", sourceId: "12th-commerce", targetId: "company-secretary", label: "Professional route", visibleIn: ["public"] },
  { edgeId: "commerce-cma", sourceId: "12th-commerce", targetId: "cost-accountancy", label: "Professional route", visibleIn: ["public"] },
  { edgeId: "arts-ba", sourceId: "12th-arts", targetId: "ba", label: "Can take", visibleIn: ["public"] },
  { edgeId: "arts-journalism", sourceId: "12th-arts", targetId: "journalism", label: "Can take", visibleIn: ["public"] },
  { edgeId: "arts-law", sourceId: "12th-arts", targetId: "llb", label: "Can take", visibleIn: ["public"] },
  { edgeId: "arts-upsc", sourceId: "12th-arts", targetId: "civil-services", label: "Career goal", visibleIn: ["public"] },
  { edgeId: "open-design", sourceId: "open-school", targetId: "diploma-design", label: "Can take", visibleIn: ["public"] },
  { edgeId: "open-hotel", sourceId: "open-school", targetId: "hotel-management", label: "Can take", visibleIn: ["public"] },
  { edgeId: "btech-software", sourceId: "btech-cse", targetId: "software-engineer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "btech-data", sourceId: "btech-cse", targetId: "data-scientist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "btech-ai", sourceId: "btech-cse", targetId: "ai-engineer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "bca-software", sourceId: "bca", targetId: "software-engineer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "bsc-research", sourceId: "bsc", targetId: "research-scientist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "bsc-professor", sourceId: "bsc", targetId: "professor", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "nda-armed", sourceId: "nda", targetId: "armed-forces", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "mbbs-doctor", sourceId: "mbbs", targetId: "doctor", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "nursing-nurse", sourceId: "bsc-nursing", targetId: "nurse", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "bcom-accounting", sourceId: "bcom", targetId: "chartered-accountant", label: "Supports", visibleIn: ["public"] },
  { edgeId: "bba-business", sourceId: "bba", targetId: "business-analyst", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "ca-career", sourceId: "chartered-accountancy", targetId: "chartered-accountant", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "cs-career", sourceId: "company-secretary", targetId: "company-secretary-career", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "cma-career", sourceId: "cost-accountancy", targetId: "cost-accountant", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "journalism-career", sourceId: "journalism", targetId: "journalist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "law-career", sourceId: "llb", targetId: "lawyer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "design-career", sourceId: "diploma-design", targetId: "uiux-designer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "hotel-career", sourceId: "hotel-management", targetId: "hotel-manager", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "agri-career", sourceId: "agriculture", targetId: "agricultural-scientist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "vet-career", sourceId: "veterinary", targetId: "veterinarian", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "pcb-bds", sourceId: "science-pcb", targetId: "bds", label: "Can take", visibleIn: ["public"] },
  { edgeId: "bds-dentist", sourceId: "bds", targetId: "dentist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "pcb-bpharm", sourceId: "science-pcb", targetId: "bpharm", label: "Can take", visibleIn: ["public"] },
  { edgeId: "bpharm-pharmacist", sourceId: "bpharm", targetId: "pharmacist", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "pcb-paramedical", sourceId: "science-pcb", targetId: "paramedical-diploma", label: "Can take", visibleIn: ["public"] },
  { edgeId: "paramedical-labtech", sourceId: "paramedical-diploma", targetId: "lab-technician", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "pcm-barch", sourceId: "science-pcm", targetId: "barch", label: "Can take", visibleIn: ["public"] },
  { edgeId: "barch-architect", sourceId: "barch", targetId: "architect", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "polytechnic-civil", sourceId: "polytechnic", targetId: "civil-engineer", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "nda-pilot", sourceId: "nda", targetId: "pilot", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "arts-police", sourceId: "arts-stream", targetId: "police-officer", label: "UPSC/State entry", visibleIn: ["public"] },
  { edgeId: "ba-teacher", sourceId: "ba", targetId: "teacher", label: "Leads to", visibleIn: ["public"] },
  { edgeId: "design-graphic", sourceId: "diploma-design", targetId: "graphic-designer", label: "Leads to", visibleIn: ["public"] },
];

async function upsertMany(model, docs, key) {
  if (!docs || !docs.length) return;
  const operations = docs.map((doc) => ({
    updateOne: {
      filter: { [key]: doc[key] },
      update: { $set: doc },
      upsert: true,
    },
  }));
  await model.bulkWrite(operations, { ordered: false });
}


async function seedDatabase() {
  await College.deleteMany({ slug: { $in: obsoleteCollegeSlugs } });

  await upsertMany(Question, sampleQuestions, "order");
  await upsertMany(Course, sampleCourses, "slug");
  await upsertMany(Deadline, sampleDeadlines, "title");
  await upsertMany(RoadmapNode, roadmapNodes, "nodeId");
  await upsertMany(RoadmapEdge, roadmapEdges, "edgeId");

  const courses = await Course.find();
  const courseMap = Object.fromEntries(courses.map((course) => [course.slug, course._id]));

  const resources = [
    {
      title: "Programming Foundations Roadmap",
      subject: "Computer Science",
      format: "Roadmap",
      link: "https://roadmap.sh/",
      language: "English",
      courseMapping: [courseMap["btech-cse"], courseMap["bca"], courseMap["bsc-computer-science"]].filter(Boolean),
      description: "Beginner-friendly roadmap for software, AI, and core computing concepts.",
    },
    {
      title: "Commerce Career Kickstart",
      subject: "Commerce",
      format: "Guide",
      link: "https://example.com/commerce-pack",
      language: "English",
      courseMapping: [courseMap["bcom"], courseMap["bba"], courseMap["chartered-accountancy"]].filter(Boolean),
      description: "A starter pack for business, finance, and accounting pathways.",
    },
    {
      title: "Creative Path Explorer",
      subject: "Design and Media",
      format: "Toolkit",
      link: "https://example.com/design-kit",
      language: "English",
      courseMapping: [courseMap["diploma-graphic-design"], courseMap["ba-journalism-mass-communication"]].filter(Boolean),
      description: "Starter references for media, visual thinking, and digital design.",
    },
  ];

  await upsertMany(Resource, resources, "title");

  const colleges = [
    {
      name: "COEP Technological University",
      slug: "coep-technological-university",
      location: { state: "Maharashtra", city: "Pune", address: "Shivajinagar, Pune", lat: 18.5294, lng: 73.8567 },
      type: "Government",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["btech-cse"], courseMap["bsc-computer-science"]].filter(Boolean),
      facilities: ["Labs", "Library", "Innovation Cell", "Wi-Fi"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 75,000 - 1,60,000 / year",
      cutoffInfo: "Engineering admission typically follows state and national entrance ranks.",
      contact: { website: "https://www.coep.org.in/", phone: "+91 20 25507000", email: "admissions@coep.ac.in" },
      source: { label: "Official institute site", url: "https://www.coep.org.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Christ University",
      slug: "christ-university",
      location: { state: "Karnataka", city: "Bengaluru", address: "Hosur Road, Bengaluru", lat: 12.9352, lng: 77.6057 },
      type: "Private",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["bca"], courseMap["bba"], courseMap["ba-psychology"]].filter(Boolean),
      facilities: ["Library", "Seminar Halls", "Career Center", "Wi-Fi"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 80,000 - 2,50,000 / year",
      cutoffInfo: "Program-specific application, entrance, and interview process.",
      contact: { website: "https://christuniversity.in/", phone: "+91 80 40129000", email: "admissions@christuniversity.in" },
      source: { label: "Official university site", url: "https://christuniversity.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Shri Ram College of Commerce",
      slug: "shri-ram-college-of-commerce",
      location: { state: "Delhi", city: "New Delhi", address: "North Campus, Delhi University", lat: 28.6886, lng: 77.2087 },
      type: "Government-aided",
      mediumOfInstruction: ["English", "Hindi"],
      coursesOffered: [courseMap["bcom"], courseMap["bba"]].filter(Boolean),
      facilities: ["Library", "Commerce Labs", "Career Cell"],
      hostel: false,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 35,000 - 90,000 / year",
      cutoffInfo: "UG admission usually follows central counselling and merit trends.",
      contact: { website: "https://srcc.edu/", phone: "+91 11 27666519", email: "principal@srcc.du.ac.in" },
      source: { label: "Official college site", url: "https://srcc.edu/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Lady Shri Ram College for Women",
      slug: "lady-shri-ram-college",
      location: { state: "Delhi", city: "New Delhi", address: "Lajpat Nagar, New Delhi", lat: 28.5665, lng: 77.2431 },
      type: "Government-aided",
      mediumOfInstruction: ["English", "Hindi"],
      coursesOffered: [courseMap["ba-psychology"], courseMap["ba-journalism-mass-communication"], courseMap["llb"]].filter(Boolean),
      facilities: ["Media Lab", "Library", "Student Counseling", "Wi-Fi"],
      hostel: false,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 30,000 - 1,10,000 / year",
      cutoffInfo: "Program admission depends on central counselling and college-specific criteria.",
      contact: { website: "https://lsr.edu.in/", phone: "+91 11 45494949", email: "info@lsr.edu.in" },
      source: { label: "Official college site", url: "https://lsr.edu.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Institute of Hotel Management Pusa",
      slug: "ihm-pusa",
      location: { state: "Delhi", city: "New Delhi", address: "Pusa, New Delhi", lat: 28.6364, lng: 77.1587 },
      type: "Government",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["diploma-hotel-management"]].filter(Boolean),
      facilities: ["Training Kitchens", "Library", "Placement Cell"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 60,000 - 1,80,000 / year",
      cutoffInfo: "Hospitality admission generally follows NCHMCT JEE and institute rules.",
      contact: { website: "https://www.ihmpusa.net/", phone: "+91 11 25841411", email: "principal@ihmpusa.net" },
      source: { label: "Official institute site", url: "https://www.ihmpusa.net/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "National Institute of Fashion Technology Bengaluru",
      slug: "nift-bengaluru",
      location: { state: "Karnataka", city: "Bengaluru", address: "H.S.R Layout, Bengaluru", lat: 12.9116, lng: 77.6477 },
      type: "Government",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["diploma-graphic-design"]].filter(Boolean),
      facilities: ["Design Studios", "Library", "Industry Projects"],
      hostel: false,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 1,20,000 - 3,00,000 / year",
      cutoffInfo: "Design admission depends on NIFT entrance and portfolio evaluation.",
      contact: { website: "https://www.nift.ac.in/bengaluru/", phone: "+91 80 22552550", email: "nift.bengaluru@nift.ac.in" },
      source: { label: "Official institute site", url: "https://www.nift.ac.in/bengaluru/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Indian Institute of Technology Bombay (IITB)",
      slug: "iit-bombay",
      location: { state: "Maharashtra", city: "Mumbai", address: "Powai, Mumbai", lat: 19.1334, lng: 72.9133 },
      type: "Government (NIRF #1 Engineering)",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["btech-cse"], courseMap["bsc-computer-science"]].filter(Boolean),
      facilities: ["Supercomputing Center", "Robotics Lab", "Central Library", "Sports Complex", "Hostel"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 1,20,000 - 2,50,000 / year",
      cutoffInfo: "Admissions strictly based on JEE Advanced All India Top Ranks.",
      contact: { website: "https://www.iitb.ac.in/", phone: "+91 22 25722545", email: "gateoffice@iitb.ac.in" },
      source: { label: "Official IIT Bombay Portal", url: "https://www.iitb.ac.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Indian Institute of Technology Delhi (IITD)",
      slug: "iit-delhi",
      location: { state: "Delhi", city: "New Delhi", address: "Hauz Khas, New Delhi", lat: 28.5450, lng: 77.1926 },
      type: "Government (NIRF Top 2)",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["btech-cse"], courseMap["bsc-computer-science"]].filter(Boolean),
      facilities: ["AI & Data Center", "Nanotech Lab", "Research Park", "Hostels"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 1,15,000 - 2,40,000 / year",
      cutoffInfo: "Admissions strictly based on JEE Advanced Top Cutoffs.",
      contact: { website: "https://home.iitd.ac.in/", phone: "+91 11 26597135", email: "webmaster@iitd.ac.in" },
      source: { label: "Official IIT Delhi Portal", url: "https://home.iitd.ac.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "All India Institute of Medical Sciences (AIIMS)",
      slug: "aiims-new-delhi",
      location: { state: "Delhi", city: "New Delhi", address: "Ansari Nagar, New Delhi", lat: 28.5672, lng: 77.2100 },
      type: "Government (NIRF #1 Medical)",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["mbbs"], courseMap["bpharm"]].filter(Boolean),
      facilities: ["Specialty Hospital Labs", "Genomics Research Center", "Medical Library"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 5,850 / year (Government Subsidized)",
      cutoffInfo: "Admissions strictly based on NEET-UG All India Top Ranks.",
      contact: { website: "https://www.aiims.edu/", phone: "+91 11 26588500", email: "info@aiims.edu" },
      source: { label: "Official AIIMS Medical Portal", url: "https://www.aiims.edu/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "Birla Institute of Technology & Science (BITS Pilani)",
      slug: "bits-pilani",
      location: { state: "Rajasthan", city: "Pilani", address: "Vidya Vihar, Pilani", lat: 28.3639, lng: 75.5870 },
      type: "Deemed University (Top Private)",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["btech-cse"], courseMap["bsc-computer-science"]].filter(Boolean),
      facilities: ["Practice School Network", "Innovation Hub", "24/7 Wi-Fi Library"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 2,45,000 - 4,80,000 / year",
      cutoffInfo: "Admissions strictly based on BITSAT Entrance Examination.",
      contact: { website: "https://www.bits-pilani.ac.in/", phone: "+91 1596 245073", email: "admissions@pilani.bits-pilani.ac.in" },
      source: { label: "Official BITS Pilani Portal", url: "https://www.bits-pilani.ac.in/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "St. Xavier's College Mumbai",
      slug: "st-xaviers-college-mumbai",
      location: { state: "Maharashtra", city: "Mumbai", address: "5, Mahapalika Marg, Mumbai", lat: 18.9438, lng: 72.8318 },
      type: "Autonomous Top College",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["bba"], courseMap["ba-psychology"], courseMap["ba-journalism-mass-communication"]].filter(Boolean),
      facilities: ["Heritage Campus", "Mass Media Studio", "Psychology Lab", "Library"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 25,000 - 85,000 / year",
      cutoffInfo: "Admission based on 12th Board Merit & Xavier Entrance Test (XET).",
      contact: { website: "https://xaviers.edu/", phone: "+91 22 22620661", email: "webmaster@xaviers.edu" },
      source: { label: "Official St. Xavier's Portal", url: "https://xaviers.edu/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
    {
      name: "DKTE Society's Textile Engineering Institute",
      slug: "dkte-society-textile-engineering-institute",
      location: { state: "Maharashtra", city: "Kolhapur", address: "Rajwada Post Box No 130, Ichalkaranji", lat: 16.6961, lng: 74.4641 },
      type: "Private",
      mediumOfInstruction: ["English"],
      coursesOffered: [courseMap["btech-cse"], courseMap["bpharm"]].filter(Boolean),
      facilities: ["Labs", "Library", "Textile Design Labs", "Wi-Fi"],
      hostel: true,
      library: true,
      lab: true,
      internet: true,
      feesRange: "INR 85,000 - 1,40,000 / year",
      cutoffInfo: "Admissions follow MHT-CET and JEE Main entrance results.",
      contact: { website: "http://www.dktes.com/", phone: "+91 230 2439515", email: "info@dktes.com" },
      source: { label: "Official institute site", url: "http://www.dktes.com/", lastVerifiedAt: new Date("2026-06-01") },
      verifiedStatus: "verified",
    },
  ];

  await upsertMany(College, colleges, "slug");

  const demoStudentPassword = await bcrypt.hash("password123", 10);
  const demoAdminPassword = await bcrypt.hash("admin123", 10);

  const sampleUsers = [
    {
      name: "Demo Student",
      email: "student@example.com",
      phone: "9876543210",
      passwordHash: demoStudentPassword,
      role: "student",
      classLevel: "12",
      board: "CBSE",
      location: { state: "Maharashtra", city: "Pune" },
      language: "English",
      currentMarks: 85,
      interests: ["Computer Science", "Artificial Intelligence", "Mathematics"],
      strengths: ["Problem Solving", "Logical Reasoning"],
    },
    {
      name: "Demo Admin",
      email: "admin@example.com",
      phone: "9876543211",
      passwordHash: demoAdminPassword,
      role: "admin",
      classLevel: "graduate",
      board: "CBSE",
      location: { state: "Delhi", city: "New Delhi" },
      language: "English",
      currentMarks: 90,
      interests: ["Management", "Education"],
      strengths: ["Leadership", "Coordination"],
    },
  ];

  await upsertMany(User, sampleUsers, "email");
}


async function runSeed() {
  await connectDatabase();
  await seedDatabase();
  console.log("Seed completed.");
  process.exit(0);
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
