import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionCard from "../components/ui/SectionCard";
import { fetchCourseById } from "../services/platformService";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetchCourseById(id).then(setCourse);
  }, [id]);

  if (!course) {
    return <SectionCard>Loading course details...</SectionCard>;
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">{course.level}</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">{course.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{course.overview}</p>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <p className="section-title">What you study</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.subjects.map((subject) => (
              <span key={subject} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {subject}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="section-title">Skill add-ons</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.skillsLearned.map((skill) => (
              <span key={skill} className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {skill}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard>
          <p className="section-title">Career outcomes</p>
          <p className="mt-4 text-sm text-slate-600">{course.careerOutcomes.join(", ")}</p>
        </SectionCard>
        <SectionCard>
          <p className="section-title">Competitive exams</p>
          <p className="mt-4 text-sm text-slate-600">{course.exams.join(", ")}</p>
        </SectionCard>
        <SectionCard>
          <p className="section-title">Higher studies</p>
          <p className="mt-4 text-sm text-slate-600">{course.higherStudies.join(", ")}</p>
        </SectionCard>
      </div>
    </div>
  );
}
