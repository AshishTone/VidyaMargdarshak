import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";

const stateBoards = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const maharashtraDistricts = [
  "Sangli", "Satara", "Solapur", "Kolhapur", "Pune", "Akola", "Amravati", "Buldhana",
  "Yavatmal", "Washim", "Aurangabad", "Beed", "Jalna", "Osmanabad", "Nanded", "Latur",
  "Parbhani", "Hingoli", "Bhandara", "Chandrapur", "Gadchiroli", "Gondia", "Nagpur",
  "Wardha", "Ahmednagar", "Dhule", "Jalgaon", "Nandurbar", "Nashik", "Mumbai City",
  "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg",
];

function dateValue(value) {
  if (!value) return "";
  if (typeof value === "number") return `${value}-01-01`;
  return String(value).slice(0, 10);
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) return value.map(removeEmptyValues);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== "" && item !== undefined && item !== null)
      .map(([key, item]) => [key, removeEmptyValues(item)])
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    dateOfBirth: dateValue(user?.dateOfBirth),
    gender: user?.gender || "",
    classLevel: user?.profileCompleted ? user.classLevel : "",
    tenthBoard: user?.tenthBoard || user?.board || "",
    tenthPassingDate: dateValue(user?.tenthPassingDate || user?.tenthPassingYear),
    tenthOverallPercentage: user?.tenthOverallPercentage ?? "",
    subjectMarks: {
      mathematics: user?.subjectMarks?.mathematics ?? "",
      science: user?.subjectMarks?.science ?? "",
      english: user?.subjectMarks?.english ?? "",
      socialScience: user?.subjectMarks?.socialScience ?? "",
    },
    twelfthBoard: user?.twelfthBoard || "",
    twelfthPassingDate: dateValue(user?.twelfthPassingDate),
    twelfthStream: user?.twelfthStream || "",
    twelfthOverallPercentage: user?.twelfthOverallPercentage ?? "",
    twelfthSubjectMarks: {
      physics: user?.twelfthSubjectMarks?.physics ?? "",
      chemistry: user?.twelfthSubjectMarks?.chemistry ?? "",
      mathematics: user?.twelfthSubjectMarks?.mathematics ?? "",
      biology: user?.twelfthSubjectMarks?.biology ?? "",
    },
    language: user?.language || "English",
    location: {
      state: user?.location?.state || "",
      district: user?.location?.district || "",
    },
  });
  const [status, setStatus] = useState("");
  const [step, setStep] = useState(1);
  const formRef = useRef(null);
  const isTenth = form.classLevel === "10";
  const isTwelfth = form.classLevel === "12";
  const selectedBoard = isTenth ? form.tenthBoard : form.twelfthBoard;

  const updateMarks = (field, subject, value) => {
    setForm({ ...form, [field]: { ...form[field], [subject]: value } });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step !== 2) return;
    const toNumbers = (marks) => Object.fromEntries(
      Object.entries(marks).map(([subject, mark]) => [subject, mark === "" ? undefined : Number(mark)])
    );
    const profile = removeEmptyValues({
      ...form,
      tenthOverallPercentage: form.tenthOverallPercentage === "" ? undefined : Number(form.tenthOverallPercentage),
      twelfthOverallPercentage: form.twelfthOverallPercentage === "" ? undefined : Number(form.twelfthOverallPercentage),
      subjectMarks: toNumbers(form.subjectMarks),
      twelfthSubjectMarks: toNumbers(form.twelfthSubjectMarks),
    });

    try {
      const updatedUser = await updateProfile(profile);
      setStatus("Profile updated successfully.");
      if (updatedUser.profileCompleted) navigate("/dashboard");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to save your profile. Please check the details and try again.");
    }
  };

  const boardLabel = isTenth ? "10th board" : "12th board";
  const passingLabel = isTenth ? "10th passing date" : "12th passing date";

  return (
    <SectionCard>
      <div className="mb-6">
        <p className="section-title">Student Profile</p>
        <p className="mt-2 text-sm text-slate-600">Complete your education details to receive nearby college and career guidance.</p>
        {!user?.profileCompleted ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Complete the required details below to unlock your dashboard.</p>
        ) : null}
      </div>

      <div className="mb-5 flex items-center gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-blue-900 text-white" : "bg-emerald-100 text-emerald-800"}`}>1. Personal information</span>
        <span className="h-px flex-1 bg-slate-200" />
        <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"}`}>2. Marks</span>
      </div>

      <form ref={formRef} className="grid gap-6" onSubmit={handleSubmit}>
        {step === 1 ? (
        <section className="grid gap-4 rounded-2xl border border-slate-200 p-5">
          <div>
            <p className="text-base font-semibold text-slate-900">Personal information</p>
            <p className="mt-1 text-sm text-slate-600">Tell us about yourself and your completed education level.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-700">
            Full name
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Date of birth / age
            <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" type="date" required value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
          </label>
          <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
            <option value="">Gender (optional)</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={form.classLevel} onChange={(event) => setForm({ ...form, classLevel: event.target.value })}>
            <option value="">What have you completed?</option>
            <option value="10">10th completed</option>
            <option value="12">12th completed</option>
          </select>
          </div>

          {(isTenth || isTwelfth) ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-700">
                {boardLabel}
                <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={selectedBoard} onChange={(event) => {
                  const boardField = isTenth ? "tenthBoard" : "twelfthBoard";
                  setForm({ ...form, [boardField]: event.target.value, location: { ...form.location, state: event.target.value, district: "" } });
                }}>
                  <option value="">Select state board</option>
                  {stateBoards.map((state) => <option key={state}>{state}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm text-slate-700">
                {passingLabel}
                <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" type="date" required value={isTenth ? form.tenthPassingDate : form.twelfthPassingDate} onChange={(event) => setForm({ ...form, [isTenth ? "tenthPassingDate" : "twelfthPassingDate"]: event.target.value })} />
              </label>
              {selectedBoard === "Maharashtra" ? (
                <label className="grid gap-1 text-sm text-slate-700">
                  District
                  <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={form.location.district} onChange={(event) => setForm({ ...form, location: { ...form.location, district: event.target.value } })}>
                    <option value="">Select district</option>
                    {maharashtraDistricts.map((district) => <option key={district}>{district}</option>)}
                  </select>
                </label>
              ) : selectedBoard ? (
                <label className="grid gap-1 text-sm text-slate-700">District<input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={form.location.district} onChange={(event) => setForm({ ...form, location: { ...form.location, district: event.target.value } })} /></label>
              ) : null}
            </div>
          ) : null}
        </section>
        ) : null}

        {step === 2 && (isTenth || isTwelfth) ? (
          <section className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <div>
              <p className="text-base font-semibold text-slate-900">Marks</p>
              <p className="mt-1 text-sm text-slate-600">These details are optional while you are waiting for your result.</p>
            </div>
            {isTenth ? (
              <MarksSection title="10th marks" note="" marks={form.subjectMarks} subjects={[["mathematics", "Mathematics"], ["science", "Science"], ["english", "English"], ["socialScience", "Social Science"]]} overall={form.tenthOverallPercentage} onOverallChange={(value) => setForm({ ...form, tenthOverallPercentage: value })} onMarkChange={(subject, value) => updateMarks("subjectMarks", subject, value)} />
            ) : (
              <div className="grid gap-4">
                <label className="grid gap-1 text-sm text-slate-700">
                  12th stream
                  <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" required value={form.twelfthStream} onChange={(event) => setForm({ ...form, twelfthStream: event.target.value })}>
                    <option value="">Select PCM or PCB</option><option value="PCM">PCM</option><option value="PCB">PCB</option>
                  </select>
                </label>
                {form.twelfthStream ? <MarksSection title={`12th ${form.twelfthStream} marks`} note="" marks={form.twelfthSubjectMarks} subjects={form.twelfthStream === "PCM" ? [["physics", "Physics"], ["chemistry", "Chemistry"], ["mathematics", "Mathematics"]] : [["physics", "Physics"], ["chemistry", "Chemistry"], ["biology", "Biology"]]} overall={form.twelfthOverallPercentage} onOverallChange={(value) => setForm({ ...form, twelfthOverallPercentage: value })} onMarkChange={(subject, value) => updateMarks("twelfthSubjectMarks", subject, value)} /> : null}
              </div>
            )}
          </section>
        ) : null}

        {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
        <div className="flex justify-between gap-3">
          {step === 2 ? (
            <Button type="button" onClick={() => setStep(1)}>Back</Button>
          ) : <span />}
          {step === 1 ? (
            <Button type="button" onClick={(event) => {
              event.preventDefault();
              if (formRef.current?.reportValidity()) setStep(2);
            }}>Continue to marks</Button>
          ) : (
            <Button type="submit">Save profile</Button>
          )}
        </div>
      </form>
    </SectionCard>
  );
}

function MarksSection({ title, note, marks, subjects, overall, onOverallChange, onMarkChange }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-slate-900">{title}</p>
      {note ? <p className="mb-3 text-sm text-slate-600">{note}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" placeholder="Overall percentage" type="number" min="0" max="100" value={overall} onChange={(event) => onOverallChange(event.target.value)} />
        {subjects.map(([subject, label]) => <input key={subject} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" placeholder={label} type="number" min="0" max="100" value={marks[subject]} onChange={(event) => onMarkChange(subject, event.target.value)} />)}
      </div>
    </div>
  );
}
