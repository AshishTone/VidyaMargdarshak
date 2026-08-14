import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import SectionCard from "../components/ui/SectionCard";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import {
  fetchDeadlines,
  fetchRecommendedCareers,
  fetchRecommendedCourses,
  fetchRecommendedResources,
  fetchStreamRecommendation,
} from "../services/platformService";
import { exportUserReportPdf } from "../utils/pdfExport";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    classLevel: user?.classLevel || "10",
    board: user?.board || "",
    language: user?.language || "English",
    currentMarks: user?.currentMarks ?? "",
    location: {
      state: user?.location?.state || "",
      city: user?.location?.city || "",
    },
  });
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [rec, crs, car, res, ddl] = await Promise.all([
        fetchStreamRecommendation().catch(() => null),
        fetchRecommendedCourses().catch(() => []),
        fetchRecommendedCareers().catch(() => []),
        fetchRecommendedResources().catch(() => []),
        fetchDeadlines().catch(() => []),
      ]);

      exportUserReportPdf({
        user: { ...user, ...form },
        recommendation: rec,
        courses: crs,
        careers: car,
        resources: res,
        deadlines: ddl,
      });
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedUser = await updateProfile({
      ...form,
      currentMarks: form.currentMarks === "" ? undefined : Number(form.currentMarks),
    });
    setStatus("Profile updated successfully.");
    if (updatedUser.profileCompleted) {
      navigate("/dashboard");
    }
  };

  return (
    <SectionCard>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-title">Student Profile</p>
          <p className="mt-2 text-sm text-slate-600">
            This is mandatory and is the foundation for personalized guidance, course suggestions, and your roadmap.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleExportPdf}
          disabled={exporting}
          variant="ghost"
          className="flex items-center gap-2 border border-blue-200 text-blue-900 bg-blue-50/60 hover:bg-blue-100 font-semibold px-4 py-2.5 rounded-xl self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Generating..." : "Export Report (PDF)"}
        </Button>
      </div>
      {!user?.profileCompleted ? (
        <p className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Complete every section below to unlock the dashboard, personalized recommendations, and roadmap view.
        </p>
      ) : null}


      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Board"
            value={form.board}
            onChange={(event) => setForm({ ...form, board: event.target.value })}
          />
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            value={form.classLevel}
            onChange={(event) => setForm({ ...form, classLevel: event.target.value })}
          >
            <option value="10">Class 10</option>
            <option value="12">Class 12</option>
            <option value="graduate">Graduate</option>
          </select>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="State"
            value={form.location.state}
            onChange={(event) =>
              setForm({ ...form, location: { ...form.location, state: event.target.value } })
            }
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="City"
            value={form.location.city}
            onChange={(event) =>
              setForm({ ...form, location: { ...form.location, city: event.target.value } })
            }
          />
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            value={form.language}
            onChange={(event) => setForm({ ...form, language: event.target.value })}
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
            placeholder="Current marks in %"
            type="number"
            min="0"
            max="100"
            value={form.currentMarks}
            onChange={(event) => setForm({ ...form, currentMarks: event.target.value })}
          />
        </div>

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        <div>
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </SectionCard>
  );
}
