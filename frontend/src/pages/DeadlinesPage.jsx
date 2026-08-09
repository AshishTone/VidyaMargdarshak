import { useEffect, useState } from "react";
import SectionCard from "../components/ui/SectionCard";
import { fetchDeadlines } from "../services/platformService";

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    fetchDeadlines().then(setDeadlines);
  }, []);

  return (
    <SectionCard>
      <div className="mb-8">
        <p className="section-title">Admission Timeline</p>
        <p className="mt-2 text-sm text-slate-600">
          Static for now, but structured as real records with source and verification metadata.
        </p>
      </div>

      <div className="relative space-y-6 border-l-2 border-blue-200 pl-6">
        {deadlines.map((deadline) => (
          <div key={deadline._id} className="relative rounded-[1.8rem] bg-white p-5 shadow-sm">
            <div className="absolute -left-[2.05rem] top-6 h-4 w-4 rounded-full bg-blue-800 ring-4 ring-blue-100" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              {new Date(deadline.date).toLocaleDateString()}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{deadline.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {deadline.category} • {deadline.state}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Source: {deadline.source?.label} • Last verified:{" "}
              {deadline.source?.lastVerifiedAt
                ? new Date(deadline.source.lastVerifiedAt).toLocaleDateString()
                : "Pending"}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
