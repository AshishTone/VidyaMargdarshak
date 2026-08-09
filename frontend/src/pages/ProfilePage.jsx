import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import { interestOptions, strengthOptions } from "../utils/constants";

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
    interests: user?.interests || [],
    strengths: user?.strengths || [],
  });
  const [status, setStatus] = useState("");

  const toggleArrayValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
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
      <div className="mb-6">
        <p className="section-title">Student Profile</p>
        <p className="mt-2 text-sm text-slate-600">
          This is mandatory and is the foundation for personalized guidance, course suggestions, and your roadmap.
        </p>
        {!user?.profileCompleted ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Complete every section below to unlock the dashboard, personalized recommendations, and roadmap view.
          </p>
        ) : null}
      </div>

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

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleArrayValue("interests", interest)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  form.interests.includes(interest)
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Strengths</p>
          <div className="flex flex-wrap gap-2">
            {strengthOptions.map((strength) => (
              <button
                key={strength}
                type="button"
                onClick={() => toggleArrayValue("strengths", strength)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  form.strengths.includes(strength)
                    ? "bg-[var(--vm-accent)] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {strength}
              </button>
            ))}
          </div>
        </div>

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        <div>
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </SectionCard>
  );
}
