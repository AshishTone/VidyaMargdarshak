import { useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import useAuth from "../hooks/useAuth";

const after10 = [
  ["Higher Secondary (11th–12th)", "Continue through Science, Commerce, Arts, or Vocational (MCVC), keeping future degree and professional routes open."],
  ["Polytechnic Diploma", "A practical technical diploma after 10th, with options such as engineering, computer, design, and allied branches."],
  ["ITI", "Job-focused trade training including electrician, fitter, mechanic, welder, computer operator and many more."],
  ["Skill Development & Certification", "Short, practical certificates in digital skills, design, hospitality, retail, and entrepreneurship."],
  ["Open Schooling", "A flexible route to complete higher-secondary education while planning the next step."],
];
const after12 = [
  ["Science & Technology", "B.Tech / B.E., BCA, B.Sc. Computer Science, Data Science, AI/ML, Cybersecurity, Architecture and research pathways."],
  ["Medical & Health", "MBBS, BDS, B.Pharm, B.Sc. Nursing, allied health, physiotherapy, biotechnology and public health."],
  ["Commerce & Management", "B.Com, BBA, CA, CS, CMA, finance, economics, banking and business management."],
  ["Arts, Humanities & Law", "BA specialisations, journalism, mass communication, integrated law, psychology, social work and tourism."],
  ["Professional Certifications", "Cloud, digital marketing, full-stack development, NISM/NCFM, cybersecurity and other degree-enhancing certifications."],
];
export default function CoursesPage() {
  const { user } = useAuth(); const isTenth = user?.classLevel === "10"; const [filter, setFilter] = useState(""); const courses = (isTenth ? after10 : after12).filter(([name]) => name.toLowerCase().includes(filter.toLowerCase()));
  return <div className="space-y-6"><SectionCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="section-title">{isTenth ? "After-10th Course Explorer" : "After-12th Course Explorer"}</p><p className="mt-2 text-sm text-slate-600">Showing options appropriate for your current education level only.</p></div><input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400" placeholder="Search pathways" value={filter} onChange={event => setFilter(event.target.value)} /></SectionCard><div className="grid gap-6 xl:grid-cols-2">{courses.map(([name, description]) => <SectionCard key={name}><h2 className="text-2xl font-bold text-slate-950">{name}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>{isTenth && name.startsWith("Higher") ? <div className="mt-5 flex flex-wrap gap-2">{["Science", "Commerce", "Arts", "Vocational (MCVC)"].map(item => <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">{item}</span>)}</div> : null}</SectionCard>)}</div></div>;
}
