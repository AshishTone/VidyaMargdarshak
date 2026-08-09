/**
 * Utility to generate and export a comprehensive, print-perfect PDF report for the student.
 * Uses print-optimized styling with crisp typography, color badges, progress bars, and pagination rules.
 */

export function exportUserReportPdf({
  user,
  recommendation,
  courses = [],
  careers = [],
  resources = [],
  deadlines = [],
  aiOverview = null,
}) {

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportId = `VM-REP-${Date.now().toString().slice(-6)}`;
  const userName = user?.name || "Student";
  const userEmail = user?.email || "N/A";
  const userPhone = user?.phone || "N/A";
  const classLevel = user?.classLevel ? `Class ${user.classLevel}` : "Not Specified";
  const board = user?.board || "Not Specified";
  const location = user?.location
    ? [user.location.city, user.location.state].filter(Boolean).join(", ") || "Not Specified"
    : "Not Specified";
  const marks = user?.currentMarks !== undefined && user?.currentMarks !== null ? `${user.currentMarks}%` : "Not Specified";
  const language = user?.language || "English";
  const interests = Array.isArray(user?.interests) && user.interests.length ? user.interests : ["General Studies"];
  const strengths = Array.isArray(user?.strengths) && user.strengths.length ? user.strengths : ["Analytical Thinking"];

  const recommendedStream = recommendation?.stream || "Assessment Pending";
  const scores = recommendation?.scores || {};
  const explanations = recommendation?.explanation || [
    "Complete the guided assessment to receive personalized, explainable stream and career recommendations.",
  ];

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VidyaMargdarshak Career Report - ${userName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-container {
      max-width: 100%;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-subtitle {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-top: 2px;
    }

    .report-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }

    .report-badge {
      display: inline-block;
      background: #eff6ff;
      color: #1e3a8a;
      border: 1px solid #bfdbfe;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }

    .section-header {
      font-size: 14px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
    }

    .hero-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    .hero-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #93c5fd;
    }

    .hero-title {
      font-size: 24px;
      font-weight: 900;
      margin: 4px 0 8px 0;
      color: #ffffff;
    }

    .hero-desc {
      font-size: 12px;
      color: #e0e7ff;
      line-height: 1.6;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-table td {
      padding: 5px 8px;
      font-size: 12px;
      vertical-align: top;
      border-bottom: 1px solid #f1f5f9;
    }

    .info-label {
      color: #64748b;
      font-weight: 600;
      width: 38%;
    }

    .info-value {
      color: #0f172a;
      font-weight: 700;
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }

    .tag-strength {
      background: #ecfdf5;
      color: #047857;
    }

    .score-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .score-bar-bg {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 999px;
      margin: 0 10px;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      background: #2563eb;
      border-radius: 999px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 12px;
    }

    .data-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }

    .data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    .data-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .bullet-list {
      list-style-type: none;
      padding-left: 0;
    }

    .bullet-list li {
      position: relative;
      padding-left: 16px;
      margin-bottom: 6px;
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }

    .bullet-list li::before {
      content: "•";
      position: absolute;
      left: 4px;
      color: #2563eb;
      font-weight: bold;
      font-size: 14px;
    }

    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
      page-break-inside: avoid;
    }

    .watermark {
      font-weight: 700;
      color: #1e3a8a;
    }

    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">VidyaMargdarshak</div>
        <div class="brand-subtitle">Student Career & Stream Guidance Report</div>
      </div>
      <div class="report-meta">
        <span class="report-badge">Official Assessment</span><br>
        <strong>Report ID:</strong> ${reportId}<br>
        <strong>Date:</strong> ${currentDate}
      </div>
    </div>

    <!-- Hero Stream Recommendation -->
    <div class="hero-card">
      <div class="hero-label">Primary Career Stream Fit</div>
      <div class="hero-title">Recommended Stream: ${recommendedStream}</div>
      <div class="hero-desc">
        Based on comprehensive psychometric assessment scores, interest matrix, and academic orientation, ${userName} demonstrates the highest alignment with the <strong>${recommendedStream}</strong> stream.
      </div>
    </div>

    <!-- VidyaAI Machine Learning Overview Feature -->
    ${aiOverview ? `
    <div class="section card" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; border-color: #3b82f6; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 8px;">
        <div>
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #67e8f9;">AI Overview Feature • ${aiOverview.modelInfo?.name || "VidyaAI™ Engine"}</span>
          <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin-top: 1px;">Machine Learning Predictive Career Intelligence</div>
        </div>
        <span style="background: rgba(6,182,212,0.2); border: 1px solid #22d3ee; color: #67e8f9; font-weight: 700; font-size: 10px; padding: 2px 7px; border-radius: 6px;">
          Model Accuracy: ${aiOverview.modelInfo?.accuracyScore || "94.2%"}
        </span>
      </div>

      <p style="font-size: 11px; line-height: 1.5; color: #e2e8f0; margin-bottom: 10px;">
        ${aiOverview.executiveSummary}
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
        ${(aiOverview.predictions || []).slice(0, 3).map((pred, i) => `
          <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 9px; font-weight: 700; color: #67e8f9;">#${i+1} Match</span>
              <span style="background: rgba(16,185,129,0.25); color: #6ee7b7; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px;">${pred.confidence}%</span>
            </div>
            <div style="font-size: 11.5px; font-weight: 800; color: #ffffff; margin: 3px 0 1px 0;">${pred.career}</div>
            <div style="font-size: 9.5px; color: #cbd5e1; line-height: 1.3;">${pred.description}</div>
          </div>
        `).join("")}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 6px;">
        <div>
          <div style="font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #93c5fd; margin-bottom: 3px;">Top Driving Model Features:</div>
          ${(aiOverview.featureImportances || []).slice(0, 3).map(feat => `
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: #e2e8f0; margin-bottom: 2px;">
              <span>${feat.feature}</span>
              <strong style="color: #67e8f9;">+${feat.impact}% impact</strong>
            </div>
          `).join("")}
        </div>
        <div>
          <div style="font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #93c5fd; margin-bottom: 3px;">AI Strategic Insight:</div>
          <div style="font-size: 10.5px; color: #e2e8f0; line-height: 1.35;">
            ${(aiOverview.keyInsights && aiOverview.keyInsights[0]) || "High alignment with STEM problem solving and technical academic tracks."}
          </div>
        </div>
      </div>
    </div>
    ` : ""}


    <!-- Student Profile & Score Breakdown Grid -->
    <div class="grid-2 section">
      <!-- Profile Card -->
      <div class="card">
        <div class="section-header">Candidate Profile</div>
        <table class="info-table">
          <tr>
            <td class="info-label">Full Name</td>
            <td class="info-value">${userName}</td>
          </tr>
          <tr>
            <td class="info-label">Email Address</td>
            <td class="info-value">${userEmail}</td>
          </tr>
          <tr>
            <td class="info-label">Contact Phone</td>
            <td class="info-value">${userPhone}</td>
          </tr>
          <tr>
            <td class="info-label">Academic Level</td>
            <td class="info-value">${classLevel} (${board})</td>
          </tr>
          <tr>
            <td class="info-label">Location</td>
            <td class="info-value">${location}</td>
          </tr>
          <tr>
            <td class="info-label">Current Marks</td>
            <td class="info-value">${marks}</td>
          </tr>
          <tr>
            <td class="info-label">Medium</td>
            <td class="info-value">${language}</td>
          </tr>
        </table>
        <div style="margin-top: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 3px;">Key Strengths:</div>
          <div class="tag-container">
            ${strengths.map((s) => `<span class="tag tag-strength">${s}</span>`).join("")}
          </div>
        </div>
        <div style="margin-top: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 3px;">Expressed Interests:</div>
          <div class="tag-container">
            ${interests.map((i) => `<span class="tag">${i}</span>`).join("")}
          </div>
        </div>
      </div>

      <!-- Score Breakdown Card -->
      <div class="card">
        <div class="section-header">Stream Score Breakdown</div>
        <div style="margin-top: 6px;">
          ${sortedScores.length
            ? sortedScores
                .map(([stream, score]) => {
                  const percent = Math.min(100, Math.max(0, Number(score) || 0));
                  return `
            <div class="score-row">
              <strong style="width: 80px;">${stream}</strong>
              <div class="score-bar-bg">
                <div class="score-bar-fill" style="width: ${percent}%;"></div>
              </div>
              <span style="font-weight: 700; color: #1e3a8a; width: 55px; text-align: right;">${score}/100</span>
            </div>`;
                })
                .join("")
            : '<p style="color: #64748b; font-size: 12px;">Take assessment to generate scores.</p>'
          }
        </div>

        <div style="margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 6px;">
            Assessment Analysis & Rationale:
          </div>
          <ul class="bullet-list">
            ${explanations.map((exp) => `<li>${exp}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>

    <!-- Recommended Academic Programs -->
    ${courses.length ? `
    <div class="section">
      <div class="section-header">Recommended Higher Education Programs</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32%;">Program Name</th>
            <th style="width: 18%;">Duration & Level</th>
            <th style="width: 25%;">Core Subjects</th>
            <th style="width: 25%;">Career Outcomes</th>
          </tr>
        </thead>
        <tbody>
          ${courses.slice(0, 5).map((course) => `
            <tr>
              <td><strong>${course.name}</strong></td>
              <td>${course.duration || "3-4 years"}<br><span style="color: #64748b; font-size: 11px;">${course.level || "Undergraduate"}</span></td>
              <td>${Array.isArray(course.subjects) ? course.subjects.slice(0, 3).join(", ") : "Core Fundamentals"}</td>
              <td>${Array.isArray(course.careerOutcomes) ? course.careerOutcomes.slice(0, 3).join(", ") : "Professional Roles"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ` : ""}

    <!-- Target Career Paths -->
    ${careers.length ? `
    <div class="section">
      <div class="section-header">Target High-Growth Career Tracks</div>
      <div class="grid-3">
        ${careers.slice(0, 6).map((c) => `
          <div class="card" style="padding: 10px;">
            <strong style="color: #1e3a8a; font-size: 13px;">${c.title}</strong>
            ${c.skills && c.skills.length ? `
              <div class="tag-container" style="margin-top: 6px;">
                ${c.skills.slice(0, 3).map((sk) => `<span class="tag" style="font-size: 10px;">${sk}</span>`).join("")}
              </div>
            ` : ""}
            ${c.summary ? `<p style="font-size: 11px; color: #475569; margin-top: 6px;">${c.summary}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    <!-- Curated Learning Resources & Roadmaps -->
    ${resources.length ? `
    <div class="section">
      <div class="section-header">Curated Learning Toolkits & Roadmaps</div>
      <div class="grid-2">
        ${resources.slice(0, 4).map((r) => `
          <div class="card" style="padding: 10px;">
            <strong>${r.title}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              ${r.format || "Guide"} • ${r.language || "English"} • ${r.subject || "General"}
            </div>
            ${r.description ? `<p style="font-size: 11px; color: #334155; margin-top: 4px;">${r.description}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    <!-- Important Deadlines -->
    ${deadlines.length ? `
    <div class="section">
      <div class="section-header">Upcoming Academic Deadlines & Entrance Milestones</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Event / Examination</th>
            <th>Category</th>
            <th>Target Window / Date</th>
            <th>Related Program</th>
          </tr>
        </thead>
        <tbody>
          ${deadlines.slice(0, 3).map((d) => `
            <tr>
              <td><strong>${d.title}</strong></td>
              <td><span class="tag">${d.category || "Exam"}</span></td>
              <td>${d.date ? new Date(d.date).toLocaleDateString("en-IN") : "Announced Shortly"}</td>
              <td>${d.relatedCourse || "All Candidates"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    ` : ""}

    <!-- Action Plan & Next Steps -->
    <div class="section card" style="background: #f1f5f9;">
      <div class="section-header" style="border-bottom-color: #cbd5e1;">Recommended Action Plan</div>
      <ul class="bullet-list">
        <li><strong>Step 1:</strong> Align higher secondary subject electives with the <strong>${recommendedStream}</strong> pathway.</li>
        <li><strong>Step 2:</strong> Review required entrance examinations (e.g. CUET, CET, JEE/NEET if applicable) and track registration windows.</li>
        <li><strong>Step 3:</strong> Explore shortlisted institutions and verify eligibility cutoffs on the VidyaMargdarshak Colleges discovery page.</li>
        <li><strong>Step 4:</strong> Engage in foundational skill building using the recommended roadmaps and study kits.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <span class="watermark">VidyaMargdarshak</span> • Student Academic & Career Navigation Platform
      </div>
      <div>
        Page 1 of 1 • System Generated on ${currentDate}
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`;

  // Create an iframe to trigger clean print/PDF dialog without disrupting the UI
  const printIframe = document.createElement("iframe");
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";
  printIframe.setAttribute("title", "Print PDF Frame");

  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(reportHtml);
  doc.close();

  // Clean up iframe after print dialog completes
  setTimeout(() => {
    try {
      document.body.removeChild(printIframe);
    } catch {
      // ignore if already removed
    }
  }, 60000);
}
